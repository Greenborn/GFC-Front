import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConcursoDetailService } from '../concurso-detail.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { UserLogged } from 'src/app/models/user.model';

@Component({
  selector: 'app-ver-fotografias',
  templateUrl: './ver-fotografias.component.html',
  styleUrls: ['./ver-fotografias.component.scss'],
})
export class VerFotografiasComponent implements OnInit {

  @Input() modalController: ModalController;
  @Input() index: any;
  @Input() all_data: any;
  @Input() open: any;
  public yepImg: boolean = true;
  public metadataOpen: boolean = false;
  public inscriptos: any[] = [];
  public user: UserLogged | null = null;

  scale: number = 1;
  minScale: number = 1;
  maxScale: number = 6;
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
    this.index --;
    if (this.index < 0) this.index = this.all_data.length - 1
    this.resetZoom();
  }

  siguiente(){
    this.index ++;console.log(this.all_data);
    if (this.index >= this.all_data.length) this.index = 0
    this.resetZoom();
  }

  onImageLoad(event: Event) {
    this.resetZoom();
  }

  resetZoom() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
  }

  zoomIn() {
    const newScale = Math.min(this.scale * 1.5, this.maxScale);
    if (newScale !== this.scale) {
      this.scale = newScale;
    }
  }

  zoomOut() {
    const newScale = Math.max(this.scale / 1.5, this.minScale);
    if (newScale !== this.scale) {
      this.scale = newScale;
      if (newScale <= 1) {
        this.panX = 0;
        this.panY = 0;
      }
    }
  }

  fit() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
  }

  downloadImage() {
    const img = this.all_data[this.index];
    if (!img?.image?.url) return;
    const url = this.configService.imageUrl(img.image.url);
    window.open(url, '_blank');
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
    } else if (event.touches.length === 2 && this.isPinching) {
      const dist = this.getTouchDist(event.touches);
      const ratio = dist / this.pinchStartDist;
      this.scale = Math.min(Math.max(this.pinchStartScale * ratio, this.minScale), this.maxScale);
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
