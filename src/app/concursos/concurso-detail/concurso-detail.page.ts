import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';

import { ImagePostPage } from './image-post/image-post.page';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
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
import { map } from 'rxjs/operators';
import { FotografiasComponent } from './fotografias/fotografias.component';
import { ConcursantesComponent } from './concursantes/concursantes.component';
import { ConcursoDetailService } from './concurso-detail.service';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { InscribirConcursanteComponent } from './inscribir-concursante/inscribir-concursante.component';
import { ProfileContestService } from 'src/app/services/profile-contest.service';

@Component({
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
  // providers: [ ConcursoDetailService ]
})
export class ConcursoDetailPage extends ApiConsumer implements OnInit {

  // @ViewChild('ConcursoContent') pageContent: HTMLIonContentElement
  // @ViewChild('ConcursoTabs') pageTabs: HTMLIonContentElement

  mostrarFiltro: boolean = false;
  concurso: Contest = this.contestService.template;
  contestResults: ContestResult[] = [];
  images: Image[] = [];
  // profiles: Profile[] = [];
  value = { lower: 1000, upper: 1500 };
  
  resultadosConcurso: ContestResultExpanded[] = [];
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  // contest: Observable<ContestExpanded>;

  fotoclubs: Fotoclub[] = [];
  metrics: Metric[] = [];
  popover: HTMLIonPopoverElement = undefined;
  // loading: boolean = true;
  subs: Subscription[] = [];

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
    private rolificador: RolificadorService,
    public concursoDetailService: ConcursoDetailService,
    private profileContestService: ProfileContestService
  ) {
    super(alertCtrl)
   }

  async ngOnInit() {
    const tabsContent: HTMLElement = document.querySelector('#concurso-tabs')
    if (window.screen.width > 768) {
      const content: HTMLIonContentElement = document.querySelector('#concurso-content')
      // content.scrollEvents = true
      // content.addEventListener('ionScroll', ev => console.log('scroll', (ev as any).detail))
      let tiempoScroll = new Date().getTime()
      let scrolling = false
      content.addEventListener('wheel', ev => {
      // this.pageContent.addEventListener('wheel', ev => {
        // console.log('wheel', ev)
        const scrollDown = ev.deltaY > 0
        if (!scrolling) {
          let scrolling = true
          content.scrollByPoint(0, ev.deltaY, 100).then(()  => scrolling = false)
          // this.pageContent.scrollByPoint(0, ev.deltaY, 100).then(()  => scrolling = false)
        }
      })
    }
    // content.addEventListener('ionScrollStart', () => console.log('scroll start'))
    // content.addEventListener('ionScrollEnd', () => console.log('scroll end'))

    this.activatedRoute.paramMap.subscribe(async paramMap => {
      // let loading = await this.loadingCtrl.create({
      //   message: 'Please wait...'
      // });

      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Cargando...'
      })
      await loading.present()
    
      // loading.present();
      const id = parseInt(paramMap.get('id'))
      // this.loading = true
      // this.contestService.get(id).subscribe(c => this.concurso = c)

      super.fetch<Contest>(() => 
        this.contestService.get(id)
      ).subscribe(async c => {
        // console.log('recibi concurso', c)
        this.concurso = c
        this.concursoDetailService.concurso.emit(c)
        loading.dismiss()
        // obtener todos los contest result de este concurso
        const u = await this.auth.user
        super.fetch<ProfileContestExpanded[]>(() => this.rolificador.getConcursantesInscriptos(u, id)).subscribe(is => {
          this.inscriptos = is
          console.log('inscriptos', is)
          this.concursoDetailService.inscriptos.emit(is)
        })
        super.fetch<ProfileExpanded[]>(() => this.rolificador.getConcursantes(u)).subscribe(cs => {
          console.log('concursantes', cs)
          this.concursantes = cs
          this.concursoDetailService.concursantes.emit(cs)
          // this.resultadosConcurso = super.fetch<ContestResultExpanded[]>(() => 
          super.fetch<ContestResultExpanded[]>(() => 
            this.contestResultService.getAll<ContestResultExpanded>(`expand=image.profile&filter[contest_id]=${c.id}`)
          ).pipe(
            map(results => results.filter(r => cs.find(cc => cc.id == r.image.profile_id) != undefined))
          ).subscribe(rs => {
            this.resultadosConcurso = rs
            this.concursoDetailService.resultadosConcurso.emit(rs)
            // this.loading = false
            setTimeout(() => { // porque no muestra todo el contenido
              // const c = this.pageTabs
              // if (this.router.url.includes('fotografias')) {
                tabsContent.style.setProperty('height', '')
                const height = tabsContent.getBoundingClientRect().height
                // console.log('tabs content height', height)
                tabsContent.style.setProperty('height', `${height + 200}px`) 
              // }
            }, 100)
          })
        })
      })
    })
    
    // super.fetch<Profile[]>(() => this.profileService.getAll()).subscribe(p => this.profiles = p)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(f =>  this.fotoclubs = f)
  }
  ionViewWillEnter() {
    const s1 = this.concursoDetailService.postImage.subscribe(
      i => {
        this.postImage(i)
        // s1.unsubscribe()
      }
    )
    const s2 = this.concursoDetailService.reviewImage.subscribe(
      r => {
        this.reviewImage(r)
        // s2.unsubscribe()
      }     
    )
    const s3 = this.concursoDetailService.deleteImage.subscribe(
      r => {
        this.deleteImage(r)
        // s3.unsubscribe()
      }
    )
    const s4 = this.concursoDetailService.mostrarAcciones.subscribe(
      o => {
        this.mostrarAcciones(o)
        // s4.unsubscribe()
      }
    )
    const s5 = this.concursoDetailService.inscribirConcursante.subscribe(_ => this.inscribirConcursante())
    const s6 = this.concursoDetailService.desinscribirConcursante.subscribe(profileContest => this.desinscribirConcursante(profileContest))
    this.subs.push(s1, s2, s3, s4, s5, s6)
  }
  ionViewWillLeave() {
    this.subs.forEach(s => s.unsubscribe())
    this.subs = []
    console.log('subscriptions', this.subs)
  }

  // https://stackoverflow.com/questions/41451375/passing-data-into-router-outlet-child-components
//   onOutletLoaded(component: FotografiasComponent | ConcursantesComponent) {
//     component.fotoclubs = this.fotoclubs;
//     component.concursantes = this.concursantes;
//     component.resultadosConcurso = this.resultadosConcurso;
//     // component.openPopup.subscribe((options: any) => this.openPopup(options))
//     component.postImage.subscribe((i: Image) => this.postImage(i))
//     console.log('suscribed')
// } 

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

  // async mostrarAcciones(ev: any, r: ContestResultExpanded) {
  async mostrarAcciones(options: any) {
    // const i = r.image
    // this.popover = await this.popoverCtrl.create({
    //   component: MenuAccionesComponent, //componente a mostrar
    //   componentProps: {
    //     acciones: [
    //       {
    //         accion: (params: []) => this.reviewImage(r),
    //         params: [],
    //         icon: 'star-outline',
    //         label: 'Puntuar'
    //       },
    //       {
    //         accion: (params: []) => this.postImage(i),
    //         params: [],
    //         icon: 'create',
    //         label: 'Editar'
    //       },
    //       {
    //         accion: (params: number[]) => this.deleteImage(r),
    //         params: [],
    //         icon: 'trash',
    //         label: 'Borrar'
    //       }
    //     ]
    //   },
    //   cssClass: 'auto-width',
    //   event: ev,
    //   translucent: true,
    //   // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    // });

    this.popover = await this.popoverCtrl.create(options)
    await this.popover.present();
    if (this.popover != undefined)
      this.popover.onDidDismiss().then(_ => this.popover = undefined)
  }

  async inscribirConcursante() {
    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }

    const modal = await this.modalController.create({
      component: InscribirConcursanteComponent,
      cssClass: 'auto-width',
      componentProps: {
        "concursantes": this.concursantes.filter(c => this.inscriptos.findIndex(i => i.profile_id == c.id) < 0),
        "modalController": this.modalController,
        "contest": this.concurso
      }
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();

    console.log('inscribiendo concursante', data)
    const { profileContest } = data ?? {}
    if (profileContest != undefined) {
      this.inscriptos.push(profileContest)
      this.concursoDetailService.inscriptos.emit(this.inscriptos)  
    }
  }

  async desinscribirConcursante(profileContest: ProfileContestExpanded) {
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
            super.fetch<void>(() => 
              this.profileContestService.delete(profileContest.id)
            ).subscribe(
              _ => {
                console.log('deleted', _)
                this.inscriptos.splice(this.inscriptos.findIndex(i => i.id == profileContest.id), 1)
                this.concursoDetailService.inscriptos.emit(this.inscriptos)
                // this.router.navigate(['/concursos']);
              }, 
              async err => {
                (await this.alertCtrl.create({
                  header: 'Error',
                  message: err.error['error-info'][2],
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
        this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
      } 
      // else {
      //   this.metrics.push(metric)
      // }
    }
  }

  async postImage(i: Image = undefined) {
    
    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }

    const componentProps : {
      concurso: string;
      modalController: ModalController;
      profiles: Profile[]
      image?: Image
    } = {
      "concurso": this.concurso.name,
      "modalController": this.modalController,
      "profiles": this.concursantes.filter(c => this.inscriptos.findIndex(i => i.profile_id == c.id) > -1)
    }

    if (i != undefined) {
      componentProps.image = {...i}
    }

    // console.log('props post image', componentProps)

    const modal = await this.modalController.create({
      component: ImagePostPage,
      cssClass: 'auto-width',
      componentProps
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();
    console.log('dismiss image post popup con data', data);
    const { image } = data ?? {}
    if (image != undefined) {
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
              metric_id: metric.id
            })
          ).subscribe(
            // console.log('posted new result', cr)
            cr => {
              this.resultadosConcurso.push({
                ...cr,
                image,
                metric
              })
              this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
            },
            // cr => this.contestResults.push(cr),
            async err => super.displayAlert(err.error['error-info'][2])
          )
        })
        // console.log('posted image', image, 'index', i)
      } else {
        // this.images.splice(i_index, 1, image)
        console.log('updated image. updating result', r_updated)
        r_updated.image = image
        console.log('updated result', this.resultadosConcurso.find(e => e.image_id == image.id))
        this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
        // console.log('replaced image', image, 'index', i)
      }
    }
  }
  
  get fechaInicio(): string {
    return this.contestService.formatearFechaParaHTML(this.concurso.start_date ?? '');
  }
  get fechaFin(): string {
    return this.contestService.formatearFechaParaHTML(this.concurso.end_date ?? '');
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
                  message: err.error['error-info'][2],
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
                // this.alertCtrl.dismiss()
                // this.contestResults.splice(this.contestResults.findIndex(i => i.id == result_id), 1)
                this.resultadosConcurso.splice(this.resultadosConcurso.findIndex(i => i.id == result_id), 1)
                this.concursoDetailService.resultadosConcurso.emit(this.resultadosConcurso)
                super.fetch<null>(() => this.imageService.delete(image_id)).subscribe(
                  _ => {},
                  // _ => this.images.splice(this.images.findIndex(i => i.id == image_id), 1),
                  async err => super.displayAlert(err.error['error-info'][2])
                )
                super.fetch<null>(() => this.metricService.delete(metric_id)).subscribe(
                  _ => {},
                  // _ => this.metrics.splice(this.metrics.findIndex(i => i.id == metric_id), 1),
                  async err => super.displayAlert(err.error['error-info'][2])
                )

              },
              async err => super.displayAlert(err)
            )
            // return false
          }
        }
      ]
    });

    await alert.present();
  } 

}
