import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';
import { GenericAlertComponent, GenericAlertButton, GenericAlertType } from 'src/app/shared/generic-alert/generic-alert.component';

export interface AlertButton {
  text: string;
  role?: 'cancel' | 'confirm';
  handler?: () => boolean | void | Promise<void>;
}

export interface AlertOptions {
  header?: string;
  message?: string;
  type?: GenericAlertType;
  buttons?: AlertButton[];
}

@Injectable({ providedIn: 'root' })
export class AlertService {

  constructor(private modalService: ModalService) {}

  async show(options: AlertOptions, confirmHandler?: () => boolean | void | Promise<void>, cancelHandler?: () => boolean | void | Promise<void>): Promise<any> {
    if (!options.type) options.type = 'confirm';
    if (!options.buttons) {
      options.buttons = [
        { text: 'Cancelar', role: 'cancel', handler: cancelHandler },
        { text: 'Confirmar', role: 'confirm', handler: confirmHandler }
      ];
    }
    return this.createAlert(options);
  }

  async showError(options: AlertOptions): Promise<any> {
    if (!options.header) options.header = 'Error';
    if (!options.message) options.message = '.';
    options.type = 'error';
    if (!options.buttons) {
      options.buttons = [{ text: 'Ok', role: 'cancel' }];
    }
    return this.createAlert(options);
  }

  async showInfo(options: AlertOptions): Promise<any> {
    if (!options.header) options.header = 'Información';
    options.type = 'info';
    if (!options.buttons) {
      options.buttons = [{ text: 'Ok', role: 'cancel' }];
    }
    return this.createAlert(options);
  }

  async showWarning(options: AlertOptions): Promise<any> {
    if (!options.header) options.header = 'Atención';
    options.type = 'warning';
    if (!options.buttons) {
      options.buttons = [{ text: 'Ok', role: 'cancel' }];
    }
    return this.createAlert(options);
  }

  private createAlert(options: AlertOptions): Promise<any> {
    const buttons: GenericAlertButton[] = (options.buttons || []).map(b => ({ ...b }));

    return this.modalService.showModal(
      GenericAlertComponent,
      {
        header: options.header || '',
        message: options.message || '',
        type: options.type || 'info',
        buttons,
        modalController: { dismiss: (data?: any) => this.modalService.dismiss(data) },
      },
      'auto-width',
      '',
      options.header || 'Mensaje'
    );
  }
}
