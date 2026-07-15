import { Component, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConcursoDetailService } from '../concurso-detail.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { UserLogged } from 'src/app/models/user.model';

@Component({
  standalone: false,
  selector: 'app-ver-fotografias',
  templateUrl: './ver-fotografias.component.html',
  styleUrls: ['./ver-fotografias.component.scss'],
})
export class VerFotografiasComponent implements OnInit {

  @Input() modalController: any;
  @Input() index: any;
  @Input() all_data: any;
  @Input() open: any;
  @Input() hasMore: boolean = false;
  @Input() loadMoreImages: (() => Promise<void>) | null = null;
  public yepImg: boolean = true;
  public imageLoading: boolean = true;
  public loadingMore: boolean = false;
  public metadataOpen: boolean = false;
  public inscriptos: any[] = [];
  public user: UserLogged | null = null;

  scale: number = 1;
  minScale: number = 1;
  maxScale: number = 25;
  panX: number = 0;
  panY: number = 0;

  isDragging: boolean = false;
  isFullscreen: boolean = false;

  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartPanX: number = 0;
  private dragStartPanY: number = 0;

  private isPinching: boolean = false;
  private pinchStartDist: number = 0;
  private pinchStartScale: number = 1;

  get imageTransform(): string {
    if (this.scale <= 1) return 'none';
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  constructor(
    public responsiveService: ResponsiveService,
    public configService: ConfigService,
    public concursoDetailService: ConcursoDetailService,
    public auth: AuthService,
    public rolificador: RolificadorService,
  ) { }

  get canDownload(): boolean {
    return this.user != null;
  }

  ngOnInit() {
    this.auth.user.then(u => this.user = u);
    const s2 = this.concursoDetailService.inscriptos.subscribe(cs =>{
      this.inscriptos = cs
    })
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
  }

  toggleMetadata(){
    this.metadataOpen = !this.metadataOpen;
  }

  anterior(){
    this.index--;
    if (this.index < 0) this.index = this.all_data.length - 1
    this.yepImg = true;
    this.imageLoading = true;
    this.resetZoom();
  }

  async siguiente(){
    if (this.loadingMore) return;
    this.index++;
    if (this.index >= this.all_data.length) {
      if (this.hasMore && this.loadMoreImages) {
        this.loadingMore = true;
        this.imageLoading = true;
        await this.loadMoreImages();
        this.loadingMore = false;
        if (this.index < this.all_data.length) {
          this.yepImg = true;
          this.imageLoading = true;
          this.resetZoom();
          return;
        }
      }
      this.index = 0;
    }
    this.yepImg = true;
    this.imageLoading = true;
    this.resetZoom();
  }

  onImageLoad(event: Event) {
    this.imageLoading = false;
    this.resetZoom();
  }

  onImageError() {
    this.yepImg = false;
    this.imageLoading = false;
  }

  resetZoom() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
  }

  zoomIn() {
    const newScale = Math.min(this.scale + 1, this.maxScale);
    if (newScale !== this.scale) {
      this.scale = newScale;
      this.applyPanConstraints();
    }
  }

  zoomOut() {
    const newScale = Math.max(this.scale - 1, this.minScale);
    if (newScale !== this.scale) {
      this.scale = newScale;
      if (newScale <= 1) {
        this.panX = 0;
        this.panY = 0;
      } else {
        this.applyPanConstraints();
      }
    }
  }

  fit() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
  }

  async downloadImage() {
    const img = this.all_data[this.index];
    if (!img?.image?.url) return;
    const url = this.configService.imageUrl(img.image.url);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = img.image.title || 'imagen';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  }

  onDragStart(event: MouseEvent) {
    if (this.scale <= 1) return;
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartPanX = this.panX;
    this.dragStartPanY = this.panY;
  }

  onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const dx = event.clientX - this.dragStartX;
    const dy = event.clientY - this.dragStartY;
    this.panX = this.dragStartPanX + dx;
    this.panY = this.dragStartPanY + dy;
    this.applyPanConstraints();
  }

  onDragEnd(event: MouseEvent) {
    this.isDragging = false;
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1 && this.scale > 1) {
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartY = event.touches[0].clientY;
      this.dragStartPanX = this.panX;
      this.dragStartPanY = this.panY;
    } else if (event.touches.length === 2) {
      this.isDragging = false;
      this.isPinching = true;
      this.pinchStartDist = this.getTouchDist(event.touches);
      this.pinchStartScale = this.scale;
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 1 && this.isDragging) {
      const dx = event.touches[0].clientX - this.dragStartX;
      const dy = event.touches[0].clientY - this.dragStartY;
      this.panX = this.dragStartPanX + dx;
      this.panY = this.dragStartPanY + dy;
      this.applyPanConstraints();
    } else if (event.touches.length === 2 && this.isPinching) {
      const dist = this.getTouchDist(event.touches);
      const ratio = dist / this.pinchStartDist;
      this.scale = Math.min(Math.max(this.pinchStartScale * ratio, this.minScale), this.maxScale);
      this.applyPanConstraints();
    }
  }

  onTouchEnd(event: TouchEvent) {
    this.isDragging = false;
    this.isPinching = false;
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  private getTouchDist(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private applyPanConstraints() {
    const wrapper = document.querySelector('.image-wrapper') as HTMLElement;
    if (!wrapper) return;
    const cw = wrapper.clientWidth;
    const ch = wrapper.clientHeight;
    if (cw <= 0 || ch <= 0) return;
    const extraX = ((this.scale - 1) * cw) / 2;
    const extraY = ((this.scale - 1) * ch) / 2;
    const marginX = cw * 0.45;
    const marginY = ch * 0.45;
    const limitX = extraX + marginX;
    const limitY = extraY + marginY;
    this.panX = Math.min(Math.max(this.panX, -limitX), limitX);
    this.panY = Math.min(Math.max(this.panY, -limitY), limitY);
  }

  async toggleFullscreen() {
    const el = document.querySelector('.visor-container') as HTMLElement;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  }

  private onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  get isContestNotFin() {return
  }

}
