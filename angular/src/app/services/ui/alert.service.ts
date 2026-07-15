import { Injectable } from '@angular/core';

export interface AlertButton {
  text: string;
  role?: 'cancel' | 'confirm';
  handler?: () => boolean | void | Promise<void>;
}

export interface AlertOptions {
  header?: string;
  message?: string;
  buttons?: AlertButton[];
}

@Injectable({ providedIn: 'root' })
export class AlertService {

  async show(options: AlertOptions, confirmHandler?: () => boolean | void | Promise<void>, cancelHandler?: () => boolean | void | Promise<void>): Promise<any> {
    return this.createAlert(options, confirmHandler, cancelHandler);
  }

  async showError(options: AlertOptions): Promise<any> {
    if (!options.header) options.header = 'Error';
    if (!options.message) options.message = '.';
    if (!options.buttons) {
      options.buttons = [{ text: 'Ok', role: 'cancel' }];
    }
    return this.createAlert(options);
  }

  private createAlert(
    options: AlertOptions,
    confirmHandler?: () => boolean | void | Promise<void>,
    cancelHandler?: () => boolean | void | Promise<void>
  ): Promise<any> {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);

      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal fade show d-block';
      modalDiv.style.display = 'block';
      modalDiv.tabIndex = -1;

      const dialog = document.createElement('div');
      dialog.className = 'modal-dialog modal-dialog-centered modal-sm';

      const content = document.createElement('div');
      content.className = 'modal-content';

      if (options.header) {
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `<h5 class="modal-title">${options.header}</h5>`;
        content.appendChild(header);
      }

      if (options.message) {
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.textContent = options.message;
        content.appendChild(body);
      }

      if (options.buttons && options.buttons.length > 0) {
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        options.buttons.forEach((btn) => {
          const btnEl = document.createElement('button');
          const btnClass = btn.role === 'cancel'
            ? 'btn btn-secondary'
            : 'btn btn-primary';
          btnEl.className = btnClass;
          btnEl.textContent = btn.text;
          btnEl.addEventListener('click', async () => {
            if (btn.handler) {
              await btn.handler();
            }
            this.cleanup(modalDiv, backdrop);
            resolve({ role: btn.role });
          });
          footer.appendChild(btnEl);
        });
        content.appendChild(footer);
      }

      dialog.appendChild(content);
      modalDiv.appendChild(dialog);
      document.body.appendChild(modalDiv);
    });
  }

  private cleanup(modalDiv: HTMLElement, backdrop: HTMLElement) {
    modalDiv.remove();
    backdrop.remove();
  }
}
