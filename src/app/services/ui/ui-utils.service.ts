import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';
import { AlertOptions, ComponentRef, LoadingOptions } from '@ionic/core';
import { MenuAccionesComponent, MenuAccionesComponentAccion } from 'src/app/shared/menu-acciones/menu-acciones.component';

@Injectable({
  providedIn: 'root'
})
export class UiUtilsService {

  popover: HTMLIonPopoverElement = undefined;
  loading: HTMLIonLoadingElement = undefined;

  constructor(
    public popoverController: PopoverController,
    public modalController: ModalController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    ) { }

  async mostrarMenuAcciones(
    acciones: MenuAccionesComponentAccion[], 
    event: any
  ) {
    // const i = r.image
    // this.popover = await this.popoverController.create({
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
    let popover: HTMLIonPopoverElement;
    // loading: boolean = true;
    const options = {
      component: MenuAccionesComponent,
      componentProps: { acciones, onClick: () => popover.dismiss() },
      cssClass: 'auto-width',
      event,
      translucent: true,
    }
    popover = await this.popoverController.create(options)
    await popover.present();
    this.popover = popover
    if (this.popover != undefined)
      this.popover.onDidDismiss().then(_ => this.popover = undefined)
  }

  async mostrarModal(
    component: ComponentRef, 
    componentProps: any = {}
  ): Promise<any> {
    if (this.popover != undefined) {
      this.popoverController.dismiss(this.popover)
      this.popover = undefined
    }

    componentProps.modalController = this.modalController

    const modal = await this.modalController.create({
      component,
      cssClass: 'auto-width',
      componentProps
    });
    await modal.present()

    const { data } = await modal.onWillDismiss();
    return data ?? {}
  }

  async mostrarAlert(
    options: AlertOptions,
    confirmHandler: () => boolean | Promise<void> = async () => {},
    cancelHandler: () => boolean | Promise<void> = async () => {}
  ) {    
    if (this.popover != undefined) {
    this.popoverController.dismiss(this.popover)
    this.popover = undefined
    }
  
    if (options.header == undefined) {
      options.header = 'Alert'
    }
    if (options.message == undefined) {
      options.message = 'Confirmar acción'
    }
    if (options.buttons == undefined) {
      options.buttons = [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: cancelHandler
        }, {
          text: 'Confirmar',
          handler: confirmHandler
        }
      ]
    }

    const alert = await this.alertController.create(options);

    await alert.present();

    return alert
  }

  async mostrarError(options: AlertOptions) {
    if (options.header == undefined) {
      options.header = 'Error'
    }
    if (options.message == undefined) {
      options.message = '.'
    }
    if (options.buttons == undefined) {
      options.buttons = [{
        text: 'Ok',
        role: 'cancel'
      }]
    }
    this.mostrarAlert(options) 
  }

  async presentLoading(options: LoadingOptions = {
    cssClass: 'my-custom-class',
    message: 'Cargando...'
  }) {
    const loading = await this.loadingController.create(options)
    this.loading = loading
    return loading.present()
  }

  dismissLoading() {
    if (this.loading != undefined) {
      this.loading.dismiss()
      this.loading = undefined
    }
  }


}
