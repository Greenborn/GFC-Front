import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';

import { ImagePostPage } from './image-post/image-post.page';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { Image } from 'src/app/models/image.model';
import { ContestResult } from 'src/app/models/contest_result.model';
import { Profile } from 'src/app/models/profile.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ImageReviewPage } from './image-review/image-review.page';
import { Metric } from 'src/app/models/metric.model';
import { ContestService } from 'src/app/services/contest.service';
import { Contest } from 'src/app/models/contest.model';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ProfileService } from 'src/app/services/profile.service';
import { MetricService } from 'src/app/services/metric.service';
import { ContestResultService } from 'src/app/services/contest-result.service';
import { ImageService } from 'src/app/services/image.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
})
export class ConcursoDetailPage extends ApiConsumer implements OnInit {

  mostrarFiltro: boolean = false;
  concurso: Contest = this.contestService.template;
  contestResults: ContestResult[] = [];
  images: Image[] = [];
  profiles: Profile[] = [];
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
  ) {
    super('concurso detail page', alertCtrl)
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
      ).subscribe(c => {
        // console.log('recibi concurso', c)
        this.concurso = c
        // obtener todos los contest result de este concurso
        super.fetch<ContestResult[]>(() => 
          this.contestResultService.getAll(`filter[contest_id]=${c.id}`)
        ).subscribe(rs => {  // console.log('recibi contest results', rs)
          this.contestResults = rs
          // para cada contest result
          for (const r of rs) {
            //->obtener todas las metricas asociadas
            super.fetch<Metric>(() => 
              this.metricService.get(r.metric_id)
            ).subscribe(m => this.metrics.push(m))
          //->obtener todas las imagenes asociadas
            super.fetch<Image>(() =>
              this.imageService.get(r.image_id)
            ).subscribe(async i => {
              // console.log('recibi imagen con id', r.image_id, i)
              this.images.push(i)
            })
          }
        })
      })
    })
    
    super.fetch<Profile[]>(() => this.profileService.getAll()).subscribe(p => this.profiles = p)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(f =>  this.fotoclubs = f)
  }

  isLogedIn(){ //agregado para seguir manteniendo el servicio auth como private
    return this.auth.loggedIn;
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  getImage(result): Image {
    // if (this.loading) {
    //   return this.imageService.template
    // } else {
      const i = this.images.find(i => i.id == result.image_id)
      return i != undefined ? i : this.imageService.template
    // }
  }
  getProfile(result): Profile {
    // if (this.loading) {
    //   return this.profileService.template
    // } else {
      const i = this.getImage(result)
      const p = this.profiles.find(p => p.id == i.profile_id)
      return p != undefined ? p : this.profileService.template
    // }
  }
  getFotoclubName(result): string {
    // if (this.loading) {
    //   return ''
    // } else {
      const p = this.getProfile(result)
      const fc = this.fotoclubs.find(f => f.id == p.fotoclub_id)
      return fc != undefined ? fc.name : ''
    // }
  }
  getMetric(result: ContestResult): Metric {
    // if (this.loading) {
    //   return this.metricService.template
    // } else {
      return this.metrics.find(i => i.id == result.metric_id) ?? this.metricService.template
    // }
  }

  async reviewImage(i: Image, r: ContestResult) {
    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover)
      this.popover = undefined
    }

    const modal = await this.modalController.create({
      component: ImageReviewPage,
      cssClass: 'small-modal',
      componentProps: {
        "concurso": this.concurso.name,
        "modalController": this.modalController,
        "image": i,
        "contestResult": r,
        "review": this.getMetric(r)
      }
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();

    console.log('punteado imagen', data)
    const { metric } = data
    if (metric != undefined) {
      const i = this.metrics.findIndex(m => m.id == metric.id)
      if (i > -1) {
        this.metrics[i] = metric
      } else {
        this.metrics.push(metric)
      }
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
      "profiles": this.profiles
    }

    if (i != undefined) {
      componentProps.image = {...i}
    }

    const modal = await this.modalController.create({
      component: ImagePostPage,
      cssClass: 'small-modal',
      componentProps
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();
    console.log('dismiss image post popup con data', data);
    const { image } = data
    if (image != undefined) {
      // this.loading = true
      const i_index = this.images.findIndex(e => e.id == image.id)
      if (i_index < 0) {
        this.images.push(image)
        super.fetch<Metric>(() =>
        this.metricService.post({
          prize: '0',
          score: 0
        })
      ).subscribe(m => {
        this.metrics.push(m)
        super.fetch<ContestResult>(() =>
          this.contestResultService.post({
            contest_id: this.concurso.id,
            image_id: image.id,
            metric_id: m.id
          })
        ).subscribe(
          cr => this.contestResults.push(cr),
          async err => super.displayAlert(err.error['error-info'][2])
        )
      })
        // console.log('posted image', image, 'index', i)
      } else {
        this.images.splice(i_index, 1, image)
        // console.log('replaced image', image, 'index', i)
      }
    }
  }
  
  get fechaInicio(): string {
    return this.contestService.formatearFechaParaHTML(this.concurso.start_date);
  }
  get fechaFin(): string {
    return this.contestService.formatearFechaParaHTML(this.concurso.end_date);
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

  async deleteImage(image_id: number, result_id: number, metric_id: number) {
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
                this.contestResults.splice(this.contestResults.findIndex(i => i.id == result_id), 1)
                super.fetch<null>(() => this.imageService.delete(image_id)).subscribe(
                  _ => this.images.splice(this.images.findIndex(i => i.id == image_id), 1),
                  async err => super.displayAlert(err.error['error-info'][2])
                )
                super.fetch<null>(() => this.metricService.delete(metric_id)).subscribe(
                  _ => this.metrics.splice(this.metrics.findIndex(i => i.id == metric_id), 1),
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

  async mostrarAcciones(ev: any, r: ContestResult) {
    const i = this.getImage(r)
    this.popover = await this.popoverCtrl.create({
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones: [
          {
            accion: (params: []) => this.reviewImage(i, r),
            params: [],
            icon: 'star-outline',
            label: 'Puntuar'
          },
          {
            accion: (params: []) => this.postImage(i),
            params: [],
            icon: 'create',
            label: 'Editar'
          },
          {
            accion: (params: number[]) => this.deleteImage(params[0], r.id, r.metric_id),
            params: [r.image_id],
            icon: 'trash',
            label: 'Borrar'
          }
        ]
      },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
      // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    });

    await this.popover.present();

    this.popover.onDidDismiss().then(_ => this.popover = undefined)
  }
}
