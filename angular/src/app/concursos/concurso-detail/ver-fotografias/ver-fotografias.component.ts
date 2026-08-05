import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConcursoDetailService } from '../concurso-detail.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { UserLogged } from 'src/app/models/user.model';
import { ZoomableImageComponent } from 'src/app/shared/zoomable-image/zoomable-image.component';

@Component({
  standalone: true,
  imports: [CommonModule, ZoomableImageComponent],
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
  public metadataOpen: boolean = false;
  public loadingMore: boolean = false;
  public isFullscreen: boolean = false;
  public inscriptos: any[] = [];
  public user: UserLogged | null = null;

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

  get currentSrc(): string {
    const item = this.all_data[this.index];
    return item?.image?.url != null ? this.configService.imageUrl(item.image.url) : '';
  }

  get currentTitle(): string {
    return this.all_data[this.index]?.image?.title || '';
  }

  ngOnInit() {
    this.auth.user.then(u => this.user = u);
    const s2 = this.concursoDetailService.inscriptos.subscribe(cs =>{
      this.inscriptos = cs
    })
  }

  toggleMetadata(){
    this.metadataOpen = !this.metadataOpen;
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.anterior();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.siguiente();
    }
  }

  anterior(){
    this.index--;
    if (this.index < 0) this.index = this.all_data.length - 1
    this.yepImg = true;
  }

  async siguiente(){
    if (this.loadingMore) return;
    this.index++;
    if (this.index >= this.all_data.length) {
      if (this.hasMore && this.loadMoreImages) {
        this.loadingMore = true;
        await this.loadMoreImages();
        this.loadingMore = false;
        if (this.index < this.all_data.length) {
          this.yepImg = true;
          return;
        }
      }
      this.index = 0;
    }
    this.yepImg = true;
  }

  get isContestNotFin() {return
  }

}
