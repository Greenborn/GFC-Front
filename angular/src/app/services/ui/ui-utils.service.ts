import { Injectable, Type } from '@angular/core';
import { ModalService } from './modal.service';
import { AlertService, AlertOptions } from './alert.service';
import { ToastService, ToastOptions } from './toast.service';
import { LoadingService } from './loading.service';
import { MenuAccionesComponentAccion } from 'src/app/shared/menu-acciones/menu-acciones.component';

@Injectable({
  providedIn: 'root'
})
export class UiUtilsService {

  constructor(
    private modalService: ModalService,
    private alertService: AlertService,
    private toastService: ToastService,
    private loadingService: LoadingService,
  ) { }

  async mostrarMenuAcciones(
    acciones: MenuAccionesComponentAccion[], 
    event: any
  ) {
    const { MenuAccionesComponent } = await import('src/app/shared/menu-acciones/menu-acciones.component');
    this.modalService.showModal(MenuAccionesComponent, { acciones, onClick: () => this.modalService.dismiss() }, 'auto-width');
  }

  async mostrarToast(buttons: any, options: ToastOptions) {
    return this.toastService.show(options);
  }

  async mostrarModal(
    component: Type<any>, 
    componentProps: any = {},
    fullscreenOnDesktop: boolean = false,
    dialogClass: string = ''
  ): Promise<any> {
    componentProps.modalController = { dismiss: (data?: any) => this.modalService.dismiss(data) };

    const cssClass = fullscreenOnDesktop ? 'modal-fullscreen' : 'auto-width';
    return this.modalService.showModal(component, componentProps, cssClass, dialogClass);
  }

  async mostrarAlert(
    options: AlertOptions,
    confirmHandler: () => boolean | Promise<void> = async () => {},
    cancelHandler: () => boolean | Promise<void> = async () => {}
  ) {    
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

    return this.alertService.show(options, confirmHandler, cancelHandler);
  }

  async mostrarError(options: AlertOptions) {
    return this.alertService.showError(options);
  }

  async presentLoading(options: any = { message: 'Cargando...' }) {
    return this.loadingService.present(options.message);
  }

  dismissLoading() {
    this.loadingService.dismiss();
  }
}
