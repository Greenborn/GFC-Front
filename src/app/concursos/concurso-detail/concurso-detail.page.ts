import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';

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

// TODO: sacar el contenido extra que se repite en informacion-component
@Component({
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
  // providers: [ ConcursoDetailService ]
})
export class ConcursoDetailPage extends ApiConsumer implements OnInit, OnDestroy {

  // @ViewChild('ConcursoTabs') pageTabs: HTMLIonContentElement
  @ViewChild('pageContent') pageContent: HTMLIonContentElement
  @ViewChild('tabsContent') tabsContent: HTMLIonRowElement

  mostrarFiltro: boolean = false;
  concurso: Contest = this.contestService.template;
  value = { lower: 1000, upper: 1500 };
  
  resultadosConcurso: ContestResultExpanded[] = [];
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  inscriptosJueces: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  seccionesInscriptas: ContestSectionExpanded[] = [];

  fotoclubs: Fotoclub[] = [];
  metrics: Metric[] = [];
  popover: HTMLIonPopoverElement = undefined;
  subs: Subscription[] = [];
  noImg: boolean = false;

  private routerEventSubscription:any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    alertCtrl: AlertController,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public auth: AuthService,
    public loadingController: LoadingController,
    
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

    this.concursoDetailService.loadContestResults()
   }
  
   async ngOnDestroy() {
    this.desubsc();

    this.routerEventSubscription.unsubscribe();
  }

  async ngOnInit() {
    const tabsContent: HTMLElement = document.querySelector('#concurso-tabs')
    if (window.screen.width > 768) {
      const content: HTMLIonContentElement = document.querySelector('#concurso-content')
      
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
        next: c => {
          this.concurso = c
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
      this.concursoDetailService.resultadosConcurso.subscribe({
        next: c => this.resultadosConcurso = c 
      })

      await this.concursoDetailService.loadContest(id)
      
    });
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
    this.popover = await this.popoverCtrl.create(options)
    await this.popover.present();
    this.popover.onDidDismiss().then(_ => this.popover = undefined)
  }

  async mostrarAcciones(options: any) {
    this.popover = await this.popoverCtrl.create(options)
    await this.popover.present();
    if (this.popover != undefined)
      this.popover.onDidDismiss().then(_ => this.popover = undefined)
  }

  async desinscribir(profileContest: ProfileContestExpanded) {
    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }
    const alert = await this.alertCtrl.create({
      header: 'Confirmar desinscripción',
      message: `Confirma desinscribir ${profileContest.profile.name} ${profileContest.profile.last_name} del concurso ${this.concurso.name}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          // handler: async () => {
          handler: () => {
            // await this.contestSvc.deleteConcurso(this.concurso.id);
            if (this.resultadosConcurso.find(r => r.image.profile_id == profileContest.profile_id) != undefined) {
              this.UIUtilsService.mostrarError({ message: 'El concursante tiene imágenes cargadas.' })
            } else {
              super.fetch<void>(() => 
                this.profileContestService.delete(profileContest.id)
              ).subscribe(
                _ => {
                  console.log('deleted', _)
                  this.inscriptos.splice(this.inscriptos.findIndex(i => i.id == profileContest.id), 1)
                  this.inscriptosJueces.splice(this.inscriptosJueces.findIndex(i => i.id == profileContest.id), 1)
                  // this.concursoDetailService.inscriptos.emit(this.inscriptos)
                  this.concursoDetailService.loadProfileContests()
                  this.concursoDetailService.loadProfileContestsJueces()
                  // this.router.navigate(['/concursos']);
                }, 
                async err => {
                  (await this.alertCtrl.create({
                    header: 'Error',
                    message: this.errorFilter(err.error['error-info'][2]),
                    buttons: [{
                      text: 'Ok',
                      role: 'cancel'
                    }]
                  })).present()
                }
              )

            }
          }
        }
      ]
    });

    await alert.present();
  }

  async reviewImage(r: ContestResultExpanded) {
    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }

    const modal = await this.modalController.create({
      component: ImageReviewPage,
      cssClass: 'auto-width',
      componentProps: {
        "concurso": this.concurso.name,
        "modalController": this.modalController,
        "image": r.image,
        "contestResult": r,
        "review": r.metric
      }
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();

    console.log('punteado imagen', data)
    const { metric } = data ?? {}
    if (metric != undefined) {
      // const i = this.metrics.findIndex(m => m.id == metric.id)
      const r = this.resultadosConcurso.find(e => e.metric_id == metric.id)
      // if (i != -1) {
        // this.metrics[i] = metric
      if (r != undefined) {
        console.log('udpating metric', r, metric)
        r.metric = metric
        console.log('udpated metric', r)
        // this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
        this.concursoDetailService.loadContestResults()
      } 
      // else {
      //   this.metrics.push(metric)
      // }
    }
  }

  async postImage(params: ImagePostParams) {
    const i = params.image
    const s = params.section_id
    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }

    const componentProps : {
      concurso: string;
      concurso_id: number;
      modalController: ModalController;
      profiles: ProfileContestExpanded[];
      secciones: Section[];
      image?: Image;
      section_id?: number;
      section_max?: number;
        resultados?: ContestResultExpanded[];
    } = {
      "concurso": this.concurso.name,
      "concurso_id": this.concurso.id,
      "modalController": this.modalController,
      "profiles": this.inscriptos,
      // "profiles": this.concursantes.filter(c => this.inscriptos.findIndex(i => i.profile_id == c.id) > -1),
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

    console.log('props post image', componentProps)

    const modal = await this.modalController.create({
      component: ImagePostPage,
      cssClass: 'auto-width',
      componentProps
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();
    console.log('dismiss image post popup con data', data);
    const { image, section_id } = data ?? {}
    if (image != undefined && section_id != undefined) {
      // this.loading = true
      // const i_index = this.images.findIndex(e => e.id == image.id)
      const r_updated = this.resultadosConcurso.find(e => e.image_id == image.id)
      if (r_updated == undefined) {
        console.log('posted new image ', image, 'posting metric')
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
          ).subscribe(
            // console.log('posted new result', cr)
            cr => {
              this.resultadosConcurso.push({
                ...cr,
                image,
                metric
              })
              this.concursoDetailService.loadContestResults()
            },
            // cr => this.contestResults.push(cr),
            async err => super.displayAlert(this.errorFilter(err.error['error-info'][2]))
          )
        })
        // console.log('posted image', image, 'index', i)
      } else {
        // this.images.splice(i_index, 1, image)
        console.log('updated image. updating result', r_updated)
        r_updated.image = image
        if (section_id != r_updated.section_id) {
          console.log('updated section. updating result', r_updated)
          const model = {
            ...r_updated,
            section_id
          }
          delete model.id
          super.fetch<ContestResult>(() =>
            this.contestResultService.post(model, r_updated.id)
          ).subscribe(
            cr => {
              console.log('updated result', cr)
              r_updated.section_id = section_id
              // this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
              
              this.concursoDetailService.loadContestResults()
            },
            err => {
              this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) })
              
              this.concursoDetailService.loadContestResults()
            },
          )  
        } else {
          console.log('updated result', this.resultadosConcurso.find(e => e.image_id == image.id))
          this.concursoDetailService.loadContestResults()
        }
        // console.log('replaced image', image, 'index', i)
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

    const alert = await this.alertCtrl.create({
      header: 'Confirmar borrado',
      message: 'Cuidado',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          // handler: async () => {
          handler: () => {
            // await this.contestSvc.deleteConcurso(this.concurso.id);
            super.fetch<void>(() => 
              this.contestService.delete(this.concurso.id)
            ).subscribe(
              _ => {
                console.log('deleted', _)
                this.router.navigate(['/concursos']);
              }, 
              async err => {
                (await this.alertCtrl.create({
                  header: 'Error',
                  message: this.errorFilter(err.error['error-info'][2]),
                  buttons: [{
                    text: 'Ok',
                    role: 'cancel'
                  }]
                })).present()
              }
            )
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteImage(r: ContestResultExpanded) {
    const { id: result_id, image_id, metric_id } = r;

    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar borrado',
      message: 'Cuidado',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: () => {
            super.fetch<null>(() => this.contestResultService.delete(result_id)).subscribe(
              _ => {
                this.resultadosConcurso.splice(this.resultadosConcurso.findIndex(i => i.id == result_id), 1)
                this.concursoDetailService.loadContestResults()
                super.fetch<null>(() => this.imageService.delete(image_id)).subscribe(
                  _ => {},
                  async err => super.displayAlert(this.errorFilter(err.error['error-info'][2]))
                )
                super.fetch<null>(() => this.metricService.delete(metric_id)).subscribe(
                  _ => {},
                  async err => super.displayAlert(this.errorFilter(err.error['error-info'][2]))
                )

              },
              async err => super.displayAlert(this.errorFilter(err))
            )
            // return false
          }
        }
      ]
    });

    await alert.present();
  } 

  openRules() {
    window.open(this.configService.apiUrl(this.concurso.rules_url), '_blank');
  }

}
