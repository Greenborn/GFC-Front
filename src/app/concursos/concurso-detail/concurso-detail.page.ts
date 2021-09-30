import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';


import { ConcursoService } from '../../services/concurso.service';
import { Concurso } from '../concurso.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ImagePostPage } from './image-post/image-post.page';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { Image } from 'src/app/models/image.model';
import { ContestResult } from 'src/app/models/contest_result.model';
import { Profile } from 'src/app/models/profile.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ImageReviewPage } from './image-review/image-review.page';
import { Metric } from 'src/app/models/metric.model';

@Component({
  selector: 'app-concurso-detail',
  templateUrl: './concurso-detail.page.html',
  styleUrls: ['./concurso-detail.page.scss'],
})
export class ConcursoDetailPage implements OnInit {

  mostrarFiltro: boolean = false;
  concurso: Concurso;
  contestResults: ContestResult[] = [];
  images: Image[] = [];
  profiles: Profile[] = [];
  fotoclubs: Fotoclub[] = [];
  metrics: Metric[] = [];
  popover: HTMLIonPopoverElement = undefined;
  loading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private contestSvc: ConcursoService,
    private userSvc: UsuarioService,
    private fotoclubSvc: FotoclubService,
    private router: Router,
    private alertCtrl: AlertController,
    // private loadingCtrl: LoadingController,
    public auth: AuthService,
    public modalController: ModalController,
    public popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      // let loading = await this.loadingCtrl.create({
      //   message: 'Please wait...'
      // });
    
      // loading.present();
      this.loading = true
      this.concurso = ConcursoService.concursoTemplate();
      this.concurso = await this.contestSvc.getConcurso(parseInt(paramMap.get('id')));
      this.reloadContestResults()
      // loading.dismiss();
      this.loading = false
    })
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  getImage(result): Image {
    return this.images.find(i => i.id == result.image_id)
  }
  getProfile(result): Profile {
    const i = this.getImage(result)
    return this.profiles.find(p => p.id == i.profile_id)
  }
  getFotoclubName(result): string {
    const p = this.getProfile(result)
    return this.fotoclubs.find(f => f.id == p.fotoclub_id).name
  }
  getMetric(result: ContestResult): Metric {
    return this.metrics.find(i => i.id == result.metric_id)
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
      if (i != -1) {
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
      image?: Image
    } = {
      "concurso": this.concurso.name,
      "modalController": this.modalController,
    }

    if (i != undefined) {
      componentProps.image = i
    }

    const modal = await this.modalController.create({
      component: ImagePostPage,
      cssClass: 'small-modal',
      componentProps
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();
    // console.log(data);
    
    if (data != undefined && data.image_id != undefined) {
      // this.loading = true
      const i = await this.contestSvc.getImage(data.image_id)
      if (this.profiles.find(p => p.id == i.profile_id) == undefined) {
        const p = await this.userSvc.getProfile(i.profile_id)
        if (this.fotoclubs.find(f => f.id == p.fotoclub_id) == undefined) {
          this.fotoclubs.push(await this.fotoclubSvc.getFotoclub(p.fotoclub_id))
        }
        this.profiles.push(p)
      }
      this.images[this.images.findIndex(i1 => i1.id == data.image_id)] = i

      const r = this.contestResults.find(r => r.image_id == data.image_id)
      
      if (r == undefined) {
        const metric_id = await this.contestSvc.postMetric({
          id: undefined,
          prize: null,
          score: null
        })
        const id = await this.contestSvc.postContestResult({
          id: r != undefined ? r.id : null,
          contest_id: this.concurso.id,
          image_id: data.image_id,
          metric_id
        })
        // console.log('posted contest result', id)
      } 
      await this.reloadContestResults()
      // this.loading = false
    }

    // return ;
  }
  
  get fechaInicio(): string {
    return ConcursoService.formatearFechaParaHTML(this.concurso.start_date);
  }
  get fechaFin(): string {
    return ConcursoService.formatearFechaParaHTML(this.concurso.end_date);
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
          handler: async () => {
            await this.contestSvc.deleteConcurso(this.concurso.id);
            this.router.navigate(['/concursos']);
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
          handler: async () => {
            await this.contestSvc.deleteImage(image_id);
            this.images.splice(this.images.findIndex(i => i.id == image_id), 1)
            await this.contestSvc.deleteContestResult(result_id);
            this.contestResults.splice(this.contestResults.findIndex(c => c.id == result_id), 1)
            await this.contestSvc.deleteMetric(metric_id);
            this.metrics.splice(this.metrics.findIndex(m => m.id == metric_id), 1)

            // this.reloadContestResults()
          }
        }
      ]
    });

    await alert.present();
  } 
  async reloadContestResults() {
    // console.log('reloading contest results')
    this.contestResults = await this.contestSvc.getContestResults(this.concurso.id)
    for (const r of this.contestResults) {
      this.contestSvc.getMetric(r.metric_id).then(m => this.metrics.push(m))
      const i = await this.contestSvc.getImage(r.image_id)
      if (this.images.find(i => i.id == r.image_id) == undefined) {
        this.images.push(i)
        if (this.profiles.find(p => p.id == i.profile_id) == undefined) {
          const p = await this.userSvc.getProfile(i.profile_id)
          this.profiles.push(p)
          if (this.fotoclubs.find(f => f.id == p.fotoclub_id) == undefined) {
            const f = await this.fotoclubSvc.getFotoclub(p.fotoclub_id)
            this.fotoclubs.push(f)
          }
        }
      }
    }
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
    // const t = this;
    // this.router.events.subscribe() // dismiss popover cuando cambie de ruta
    // const s = this.router.events
    // .pipe() // .pipe(filter(event => event instanceof NavigationEnd))
    // .subscribe(async (e) => {
    //   if (e instanceof NavigationEnd) {
    //     await this.dismissPopover();
    //     s.unsubscribe();
    //   }
    // });
  }
}
