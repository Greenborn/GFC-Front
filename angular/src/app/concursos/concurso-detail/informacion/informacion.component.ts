import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Contest } from 'src/app/models/contest.model';
import { ContestResult, ContestResultExpanded } from 'src/app/models/contest_result.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Image } from 'src/app/models/image.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { ContestRecord } from '../contest-records/models/contest.record';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Metric } from 'src/app/models/metric.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ContestService } from 'src/app/services/contest.service';
import { ContestResultService } from 'src/app/services/contest-result.service';
import { ProfileService } from 'src/app/services/profile.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { ImageService } from 'src/app/services/image.service';
import { MetricService } from 'src/app/services/metric.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConcursoDetailService } from '../concurso-detail.service';
import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ImageReviewPage } from '../image-review/image-review.page';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { CompressedPhotosService } from 'src/app/services/compressed-photos.service'
import { AlertService } from 'src/app/services/ui/alert.service';

import { get_all as get_all_contest_results, resultadosConcursoGeted } from 'src/app/services/contest-results.service'
@Component({
  standalone: false,
  selector: 'app-informacion',
  templateUrl: './informacion.component.html',
  styleUrls: ['./informacion.component.scss'],
})
export class InformacionComponent extends ApiConsumer implements OnInit, OnDestroy {

  mostrarFiltro: boolean = false;
  concurso: Contest;
  contestResults: ContestResult[] = [];
  images: Image[] = [];
  // profiles: Profile[] = [];
  value = { lower: 1000, upper: 1500 };
  isInscripto: boolean;
  resultadosConcurso: any = [];
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  seccionesInscriptas: ContestSectionExpanded[] = [];
  // contest: Observable<ContestExpanded>;

  fotoclubs: Fotoclub[] = [];
  metrics: Metric[] = [];
  subs: Subscription[] = [];
  noImg: boolean = false;

  constructor( 
    private activatedRoute: ActivatedRoute,
    private router: Router,
    alertService: AlertService,
    public auth: AuthService,
    private sanitizer: DomSanitizer,
    public contestService: ContestService,
    private contestResultService: ContestResultService,
    private fotoclubService: FotoclubService,
    private profileService: ProfileService,
    private metricService: MetricService,
    private imageService: ImageService,
    public rolificador: RolificadorService,
    public concursoDetailService: ConcursoDetailService,
    private profileContestService: ProfileContestService,
    public UIUtilsService: UiUtilsService,
    public configService: ConfigService,
    public responsiveService: ResponsiveService,
    private compressedPhotosService: CompressedPhotosService
  ) {
    super(alertService)
   }

  async ngOnDestroy() {
    this.desubsc();  
  }

  ngOnInit() {
    this.concurso = this.contestService.template;
    this.subsc();
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(f =>  this.fotoclubs = f)
}


  subsc(){
    this.subs.push(
      this.activatedRoute.paramMap.subscribe(async paramMap => {
      
        const id = parseInt(paramMap.get('id'))
  
        this.subs.push(this.concursoDetailService.concurso.subscribe({
          next: c => {
            this.concurso = c
            this.noImg = false
          } 
        }))
        this.subs.push(this.concursoDetailService.categoriasInscriptas.subscribe({
          next: c => this.categoriasInscriptas = c 
        }))
        this.subs.push(this.concursoDetailService.seccionesInscriptas.subscribe({
          next: c => this.seccionesInscriptas = c 
        }))
        this.subs.push(this.concursoDetailService.concursantes.subscribe({
          next: c => this.concursantes = c 
        }))
        this.subs.push(this.concursoDetailService.inscriptos.subscribe({
          next: c => {
            this.inscriptos = c
            this.estaInscripto()
          } 
        }))
        this.subs.push(resultadosConcursoGeted.subscribe({
          next: c => this.resultadosConcurso = c.items
        }))
        
      })
    )
  }

  descargarFotografias(){
    this.compressedPhotosService.getCompressedPhotos(this.concurso.id).subscribe(data => {
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
    });
  }

  desubsc() {
      for (const s of this.subs) {
        s.unsubscribe()
      }
      this.subs = undefined
      this.subs = []
  }
  
    isLogedIn(){ //agregado para seguir manteniendo el servicio auth como private
        return this.auth.loggedIn;
    }
    
    toggleFiltro() {
        this.mostrarFiltro = !this.mostrarFiltro;
    }
    
    getProfile(r: ContestResultExpanded): Profile {
          const p = this.concursantes.find(p => p.id == r.image.profile_id)
          return p != undefined ? p : this.profileService.template
    }
    
    getFotoclubName(fotoclub_id: number): string {
        const fc = this.fotoclubs.find(f => f.id == fotoclub_id)
        return fc != undefined ? fc.name : ''
    }
  
    getFullName(profile_id) {
      const p = this.concursantes.find(p => p.id == profile_id)
      return p != undefined ? `${p.name} ${p.last_name}` : ''
    }
  
    async openPopup(options: any) {
      if (options.component) {
        return this.UIUtilsService.mostrarModal(options.component, options.componentProps || {});
      }
    }
  
    async mostrarAcciones(options: any) {
      if (options.component) {
        return this.UIUtilsService.mostrarModal(options.component, options.componentProps || {});
      }
    }
  
    async desinscribir(profileContest: ProfileContestExpanded) {
      this.UIUtilsService.mostrarAlert({
        header: 'Confirmar desinscripción',
        message: `Confirma desinscribir ${profileContest.profile.name} ${profileContest.profile.last_name} del concurso ${this.concurso.name}?`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          }, {
            text: 'Confirmar',
            handler: () => {
              if (this.resultadosConcurso.find(r => r.image.profile_id == profileContest.profile_id) != undefined) {
                this.UIUtilsService.mostrarError({ message: 'El concursante tiene imágenes cargadas.' })
              } else {
                super.fetch<void>(() => 
                  this.profileContestService.delete(profileContest.id)
                ).subscribe({
                  next: _ => {
                    this.inscriptos.splice(this.inscriptos.findIndex(i => i.id == profileContest.id), 1)
                    this.concursoDetailService.loadProfileContests();
                  }, 
                  error: err => {
                    this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) });
                  }
                })
  
              }
            }
          }
        ]
      });
    }
  
    async reviewImage(r: ContestResultExpanded) {
      const data = await this.UIUtilsService.mostrarModal(ImageReviewPage, {
        "concurso": this.concurso.name,
        "image": r.image,
        "contestResult": r,
        "review": r.metric
      });
  
      const { metric } = data ?? {}
      if (metric != undefined) {
        const r = this.resultadosConcurso.find(e => e.metric_id == metric.id)
  
        if (r != undefined) {
          r.metric = metric
          await get_all_contest_results( { "contest_id" : this.concurso.id} )
        } 
      }
    }
    
    get categoriasInscriptasAsc() {
      return this.categoriasInscriptas.sort( (c1, c2) => {
          const n1 = c1.category.name
          const n2 = c2.category.name
          return (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1))
        })
    }
    get seccionesInscriptasAsc() {
      return this.seccionesInscriptas.sort((s1, s2) => {
        const n1 = s1.section.name
        const n2 = s2.section.name
          return (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1))
      })
    }
  
    get fechaInicio(): string {
      // return this.contestService.formatearFechaParaHTML(this.concurso.start_date ?? '');
      return this.concurso.start_date
    }
    get fechaFin(): string {
      // return this.contestService.formatearFechaParaHTML(this.concurso.end_date ?? '');
      return this.concurso.end_date
    }
  
    async deleteConcurso() {
      this.UIUtilsService.mostrarAlert({
        header: 'Confirmar borrado',
        message: 'Cuidado',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          }, {
            text: 'Confirmar',
            handler: () => {
              this.contestService.deleteContest(this.concurso.id).subscribe({
                next: response => {
                  this.router.navigate(['/concursos']);
                }, 
                error: err => {
                  const errorMsg = err?.response?.data?.message || err?.message || 'Error al eliminar el concurso';
                  this.UIUtilsService.mostrarError({ message: errorMsg });
                }
              })
            }
          }
        ]
      });
    }
  
    async deleteImage(r: ContestResultExpanded) {
      const { id: result_id, image_id, metric_id } = r;
  
      this.UIUtilsService.mostrarAlert({
        header: 'Confirmar borrado',
        message: 'Cuidado',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          }, {
            text: 'Confirmar',
            handler: () => {
              super.fetch<null>(() => this.contestResultService.delete(result_id)).subscribe({
                next: async _ => {
                  this.resultadosConcurso.splice(this.resultadosConcurso.findIndex(i => i.id == result_id), 1)
                  await get_all_contest_results( { "contest_id" : this.concurso.id} )
                  super.fetch<null>(() => this.imageService.delete(image_id)).subscribe({
                    next: _ => get_all_contest_results({ "contest_id": this.concurso.id }),
                    error: err => super.displayAlert(this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]))
                  })
                  super.fetch<null>(() => this.metricService.delete(metric_id)).subscribe({
                    next: _ => {},
                    error: err => super.displayAlert(this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]))
                  })
  
                },
                error: err => super.displayAlert(this.errorFilter(err))
              })
            }
          }
        ]
      });
    }
  
    openRules() {
      if (this.concurso.rules_url == null ) {
        this.UIUtilsService.mostrarError({ message: 'No se encuentra un reglamento cargado para este concurso.' })
      } else {
        window.open(this.configService.imageUrl(this.concurso.rules_url), '_blank');
      }
    }

  inscribirConcursante(){
    this.concursoDetailService.inscribirConcursante(undefined)
  }

  async desinscribirme(){
    const user = await this.auth.user;
    if (!user?.profile) return;
    const yo = user.profile;
    const prl = this.inscriptos.find(p => p.profile_id == yo.id)
    this.concursoDetailService.desinscribir.emit(
      prl
    )
  }

  async estaInscripto(){
    const user = await this.auth.user;
    if (!user?.profile) {
      this.isInscripto = false;
      return;
    }
    const yo = user.profile;
    const prl = this.inscriptos.find(p => p.profile_id == yo.id)
    this.isInscripto =  prl != undefined ? true : false
  }

  compartir() {
    const link = window.location.href.replace("informacion", "")
    if(navigator.clipboard) {
        navigator.clipboard.writeText(link).then(async () => {
          const { toast } = await this.UIUtilsService.mostrarToast(undefined,
              {
                "message": "El link ah sido copiado al portapepeles",
                "duration": 1000,
                "position": 'bottom',
                "color": "dark"
              }
            )
        })
    } else {
    }
  }

  getEmbedUrl(record: ContestRecord): SafeResourceUrl | null {
    let embedUrl: string | null = null;
    const url = record.url;

    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
    );
    if (ytMatch) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    const driveMatch = url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      embedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    const driveMatch2 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch2) {
      embedUrl = `https://drive.google.com/file/d/${driveMatch2[1]}/preview`;
    }

    return embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
  }

  get isContestNotFin() {
    let finalizado = (new Date()).getTime() >= (new Date(this.concurso.end_date)).getTime()
    return !(finalizado)
  }
}

