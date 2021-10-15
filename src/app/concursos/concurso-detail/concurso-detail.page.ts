import { Component, OnInit } from '@angular/core';
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
import { Observable } from 'rxjs';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { map } from 'rxjs/operators';
import { FotografiasComponent } from './fotografias/fotografias.component';
import { ConcursantesComponent } from './concursantes/concursantes.component';
import { ConcursoDetailService } from './concurso-detail.service';

@Component({
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
  // providers: [ ConcursoDetailService ]
})
export class ConcursoDetailPage extends ApiConsumer implements OnInit {

  mostrarFiltro: boolean = false;
  concurso: Contest = this.contestService.template;
  contestResults: ContestResult[] = [];
  images: Image[] = [];
  // profiles: Profile[] = [];
  value = { lower: 1000, upper: 1500 };
  
  resultadosConcurso: ContestResultExpanded[] = [];
  concursantes: ProfileExpanded[] = [];
  // contest: Observable<ContestExpanded>;

  fotoclubs: Fotoclub[] = [];
  metrics: Metric[] = [];
  popover: HTMLIonPopoverElement = undefined;
  // loading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    alertCtrl: AlertController,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public auth: AuthService,
    
    private contestService: ContestService,
    private contestResultService: ContestResultService,
    private fotoclubService: FotoclubService,
    private profileService: ProfileService,
    private metricService: MetricService,
    private imageService: ImageService,
    private rolificador: RolificadorService,
    private concursoDetailService: ConcursoDetailService
  ) {
    super(alertCtrl)
   }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      // let loading = await this.loadingCtrl.create({
      //   message: 'Please wait...'
      // });
    
      // loading.present();
      const id = parseInt(paramMap.get('id'))
      // this.loading = true
      // this.contestService.get(id).subscribe(c => this.concurso = c)

      super.fetch<Contest>(() => 
        this.contestService.get(id)
      ).subscribe(async c => {
        // console.log('recibi concurso', c)
        this.concurso = c
        // obtener todos los contest result de este concurso
        const u = await this.auth.user
        super.fetch<ProfileExpanded[]>(() => this.rolificador.getConcursantes(u)).subscribe(cs => {
          console.log('concursantes', cs)
          this.concursantes = cs
          this.concursoDetailService.concursantes.emit(cs)
          // this.resultadosConcurso = super.fetch<ContestResultExpanded[]>(() => 
          super.fetch<ContestResultExpanded[]>(() => 
            this.contestResultService.getAll<ContestResultExpanded>(`filter[contest_id]=${c.id}`)
          ).pipe(
            map(results => results.filter(r => cs.find(cc => cc.id == r.image.profile_id) != undefined))
          ).subscribe(rs => {
            this.resultadosConcurso = rs
            this.concursoDetailService.resultadosConcurso.emit(rs)
          })
        })



        // super.fetch<ContestResult[]>(() => 
        //   this.contestResultService.getAll(`filter[contest_id]=${c.id}`)
        // ).subscribe(rs => {  // console.log('recibi contest results', rs)
        //   this.contestResults = rs
        //   // para cada contest result
        //   for (const r of rs) {
        //     //->obtener todas las metricas asociadas
        //     super.fetch<Metric>(() => 
        //       this.metricService.get(r.metric_id)
        //     ).subscribe(m => this.metrics.push(m))
        //   //->obtener todas las imagenes asociadas
        //     super.fetch<Image>(() =>
        //       this.imageService.get(r.image_id)
        //     ).subscribe(async i => {
        //       // console.log('recibi imagen con id', r.image_id, i)
        //       this.images.push(i)
        //     })
        //   }
        // })
      })
    })

    this.concursoDetailService.postImage.subscribe(i => this.postImage(i))
    this.concursoDetailService.reviewImage.subscribe(r => this.reviewImage(r))
    this.concursoDetailService.deleteImage.subscribe(r => this.deleteImage(r))
    this.concursoDetailService.mostrarAcciones.subscribe(o => this.mostrarAcciones(o))
    
    // super.fetch<Profile[]>(() => this.profileService.getAll()).subscribe(p => this.profiles = p)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(f =>  this.fotoclubs = f)
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
    this.popover.onDidDismiss().then(_ => this.popover = undefined)
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
    const { metric } = data
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
      "profiles": this.concursantes
    }

    if (i != undefined) {
      componentProps.image = {...i}
    }

    const modal = await this.modalController.create({
      component: ImagePostPage,
      cssClass: 'auto-width',
      componentProps
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();
    console.log('dismiss image post popup con data', data);
    const { image } = data
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
