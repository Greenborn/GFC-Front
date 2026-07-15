import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AlertService } from 'src/app/services/ui/alert.service';
import { LoadingService } from 'src/app/services/ui/loading.service';

import { ImagePostPage, ImagePostParams } from './image-post/image-post.page';

import { Image } from 'src/app/models/image.model';
import { ContestResult, ContestResultExpanded } from 'src/app/models/contest_result.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ImageReviewPage } from './image-review/image-review.page';
import { Metric } from 'src/app/models/metric.model';
import { ContestService } from 'src/app/services/contest.service';
import { Contest, ContestExpanded } from 'src/app/models/contest.model';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ProfileService } from 'src/app/services/profile.service';
import { MetricService } from 'src/app/services/metric.service';
import { ContestResultService } from 'src/app/services/contest-result.service';
import { ImageService } from 'src/app/services/image.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { filter, map } from 'rxjs/operators';

import { ConcursoDetailService } from './concurso-detail.service';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';

import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Section } from 'src/app/models/section.model';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { get_all as get_all_contest_results, resultadosConcursoGeted } from 'src/app/services/contest-results.service';

// TODO: sacar el contenido extra que se repite en informacion-component
@Component({
  standalone: false,
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
  // providers: [ ConcursoDetailService ]
})
export class ConcursoDetailPage extends ApiConsumer implements OnInit, OnDestroy {

  // @ViewChild('ConcursoTabs') pageTabs: HTMLIonContentElement
  @ViewChild('pageContent') pageContent: any
  @ViewChild('tabsContent') tabsContent: any

  mostrarFiltro: boolean = false;
  concurso: Contest;
  value = { lower: 1000, upper: 1500 };
  
  resultadosConcurso: any = [];
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  inscriptosJueces: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  seccionesInscriptas: ContestSectionExpanded[] = [];

  fotoclubs: Fotoclub[] = [];
  metrics: Metric[] = [];
  popover: any = undefined;
  subs: Subscription[] = [];
  noImg: boolean = false;


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    alertCtrl: AlertService,
    public auth: AuthService,
    public loadingService: LoadingService,
    
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
    public configService: ConfigService
  ) {
    super(alertCtrl)
    this.concurso = this.contestService.template;
   }
  
   async ngOnDestroy() {
    this.desubsc();
  }



  async ngOnInit() {
    const tabsContent: HTMLElement = document.querySelector('#concurso-tabs')
    if (window.screen.width > 768) {
      const content: any = document.querySelector('#concurso-content')
      
      let tiempoScroll = new Date().getTime()
      let scrolling = false
    }

    this.desubsc();
    this.subsc();
    
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(f =>  this.fotoclubs = f);
  }

  subsc(){
    this.subs.push(this.concursoDetailService.postImage.subscribe(
      params => {
        this.postImage(params)
      }
    ));

    this.subs.push(this.concursoDetailService.reviewImage.subscribe(
      r => {
        this.reviewImage(r)
      }     
    ));

    this.subs.push(this.concursoDetailService.deleteImage.subscribe(
      r => {
        this.deleteImage(r)
      }
    ));

    this.subs.push(this.concursoDetailService.mostrarAcciones.subscribe(
      o => {
        this.mostrarAcciones(o)
      }
    ));
    
    this.subs.push(this.concursoDetailService.desinscribir.subscribe(profileContest => this.desinscribir(profileContest)) );
    
    this.activatedRoute.paramMap.subscribe(async paramMap => {
            
      const id = parseInt(paramMap.get('id'))
      this.concursoDetailService.imagenes_page_number = 1;
      this.concursoDetailService.concurso.subscribe({
        next: async c => {
          this.concurso = c
          await get_all_contest_results( { "contest_id" : this.concurso.id}, false )
          this.noImg = false
        } 
      })
      this.concursoDetailService.categoriasInscriptas.subscribe({
        next: c => this.categoriasInscriptas = c 
      })
      this.concursoDetailService.seccionesInscriptas.subscribe({
        next: c => this.seccionesInscriptas = c 
      })
      this.concursoDetailService.concursantes.subscribe({
        next: c => this.concursantes = c 
      })
      this.concursoDetailService.inscriptos.subscribe({
        next: c => this.inscriptos = c 
      })
      this.concursoDetailService.inscriptosJueces.subscribe({
        next: c => this.inscriptosJueces = c 
      })
      resultadosConcursoGeted.subscribe({
        next: c => this.resultadosConcurso = c.items 
      })

      await this.concursoDetailService.loadContest(id)
      this.concursoDetailService.loadConcursantes()
      this.concursoDetailService.loadJueces()
      this.concursoDetailService.loadProfileContests()
      this.concursoDetailService.loadProfileContestsJueces()
      
    });
  }
  
  goToFotografias(){
    this.router.navigate(['/concursos', this.concurso.id, 'fotografias']);
  }

desubsc() {
    for (const s of this.subs) {
      s.unsubscribe()
    }
    this.subs = undefined
    this.subs = [];
}


obtenerPx() {
  if (window.innerWidth > 767) {
    return 15;
  } else {
    return 25;
  }
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
    await this.UIUtilsService.mostrarModal(options.component, options.componentProps)
  }

  async mostrarAcciones(options: any) {
    await this.UIUtilsService.mostrarModal(options.component, options.componentProps)
  }

  async desinscribir(profileContest: ProfileContestExpanded) {
    const alert = await this.UIUtilsService.mostrarAlert({
      header: 'Confirmar desinscripción',
      message: `Confirma desinscribir ${profileContest.profile.name} ${profileContest.profile.last_name} del concurso ${this.concurso.name}?`
      }, 
      async () => {
        if (this.resultadosConcurso.find(r => r.image.profile_id == profileContest.profile_id) != undefined) {
          this.UIUtilsService.mostrarError({ message: 'El concursante tiene imágenes cargadas.' })
        } else {
          super.fetch<void>(() => 
            this.profileContestService.delete(profileContest.id)
          ).subscribe({
            next: _ => {
              this.inscriptos.splice(this.inscriptos.findIndex(i => i.id == profileContest.id), 1)
              this.inscriptosJueces.splice(this.inscriptosJueces.findIndex(i => i.id == profileContest.id), 1)
              this.concursoDetailService.loadProfileContests()
              this.concursoDetailService.loadProfileContestsJueces()
            }, 
            error: async err => {
              this.UIUtilsService.mostrarAlert({
                header: 'Error',
                message: this.errorFilter(err.error['error-info'][2])
              })
            }
          })
        }
      }
    )
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
      // const i = this.metrics.findIndex(m => m.id == metric.id)
      const r = this.resultadosConcurso.find(e => e.metric_id == metric.id)
      // if (i != -1) {
        // this.metrics[i] = metric
      if (r != undefined) {
        r.metric = metric
        // this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
        await get_all_contest_results( { "contest_id" : this.concurso.id} )
        this.concursoDetailService.refreshPhotos.emit()
      } 
      // else {
      //   this.metrics.push(metric)
      // }
    }
  }

  async postImage(params: ImagePostParams) {
    const i = params.image
    const s = params.section_id

    const componentProps : {
      concurso: string;
      concurso_id: number;
      modalController: any;
      profiles: ProfileContestExpanded[];
      secciones: Section[];
      image?: Image;
      section_id?: number;
      section_max?: number;
        resultados?: ContestResultExpanded[];
    } = {
      "concurso": this.concurso.name,
      "concurso_id": this.concurso.id,
      "modalController": { dismiss: (data?: any) => {} },
      "profiles": this.inscriptos,
      "secciones": this.seccionesInscriptas.map(s => s.section),
      "section_max": this.concurso.max_img_section,
      "resultados": this.resultadosConcurso
    }

    if (i != undefined) {
      componentProps.image = {...i}
    }
    if (s != undefined) {
      componentProps.section_id = s
    }


    const data = await this.UIUtilsService.mostrarModal(ImagePostPage, componentProps);
    const { image, section_id } = data ?? {}
    if (image != undefined && section_id != undefined) {
      // this.loading = true
      // const i_index = this.images.findIndex(e => e.id == image.id)
      const r_updated = this.resultadosConcurso.find(e => e.image_id == image.id)
      if (r_updated == undefined) {
        // this.images.push(image)
        super.fetch<Metric>(() =>
          this.metricService.post({
            prize: '0',
            score: 0
          })
          ).subscribe(metric => {
          // this.metrics.push(m)

          super.fetch<ContestResult>(() =>
            this.contestResultService.post({
              contest_id: this.concurso.id,
              image_id: image.id,
              metric_id: metric.id,
              section_id
            })
          ).subscribe({
            next: async cr => {
              this.resultadosConcurso.push({
                ...cr,
                image,
                metric
              })
              await get_all_contest_results( { "contest_id" : this.concurso.id} )
              this.concursoDetailService.refreshPhotos.emit()
            },
            // cr => this.contestResults.push(cr),
            error: async err => super.displayAlert(this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]))
          })
        })
      } else {
        // this.images.splice(i_index, 1, image)
        r_updated.image = image
        if (section_id != r_updated.section_id) {
          const model = {
            ...r_updated,
            section_id
          }
          delete model.id
          super.fetch<ContestResult>(() =>
            this.contestResultService.post(model, r_updated.id)
          ).subscribe({
            next: async cr => {
              r_updated.section_id = section_id
              // this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
              
              await get_all_contest_results( { "contest_id" : this.concurso.id} )
              this.concursoDetailService.refreshPhotos.emit()
            },
            error: async err => {
              this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]) })
              
              await get_all_contest_results( { "contest_id" : this.concurso.id} )
              this.concursoDetailService.refreshPhotos.emit()
            },
          })  
        } else {
          await get_all_contest_results( { "contest_id" : this.concurso.id} )
          this.concursoDetailService.refreshPhotos.emit()
        }
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
    await this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'Cuidado'
      }, 
      async () => {
        this.contestService.deleteContest(this.concurso.id).subscribe({
          next: response => {
            this.router.navigate(['/concursos']);
          }, 
          error: async err => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Error al eliminar el concurso';
            this.UIUtilsService.mostrarAlert({
              header: 'Error',
              message: errorMsg
            })
          }
        })
      }
    )
  }

  async deleteImage(r: ContestResultExpanded) {
    const { id: result_id, image_id, metric_id } = r;

    await this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'Cuidado'
      }, 
      async () => {
        super.fetch<null>(() => this.contestResultService.delete(result_id)).subscribe({
          next: async _ => {
            this.resultadosConcurso.splice(this.resultadosConcurso.findIndex(i => i.id == result_id), 1)
            await get_all_contest_results( { "contest_id" : this.concurso.id} )
            this.concursoDetailService.refreshPhotos.emit()
            super.fetch<null>(() => this.imageService.delete(image_id)).subscribe({
              next: _ => get_all_contest_results({ "contest_id": this.concurso.id }),
              error: async err => super.displayAlert(this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]))
            })
            super.fetch<null>(() => this.metricService.delete(metric_id)).subscribe({
              next: _ => {},
              error: async err => super.displayAlert(this.errorFilter(err.error?.message || err.error?.['error-info']?.[2]))
            })

          },
          error: async err => super.displayAlert(this.errorFilter(err))
        })
      }
    )
  } 

  openRules() {
    window.open(this.configService.imageUrl(this.concurso.rules_url), '_blank');
  }

}
