import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private element: HTMLElement | null = null;

  async present(message: string = 'Cargando...'): Promise<void> {
    this.dismiss();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(backdrop);

    const container = document.createElement('div');
    container.className = 'd-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100';
    container.style.zIndex = '99999';

    const spinner = document.createElement('div');
    spinner.className = 'text-center p-4 bg-white rounded-3 shadow';
    spinner.style.minWidth = '160px';
    spinner.innerHTML = `
      <div class="spinner-border text-primary mb-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <div class="text-dark">${message}</div>
    `;

    container.appendChild(spinner);
    document.body.appendChild(container);

    this.element = container;
  }

  dismiss(): void {
    if (this.element) {
      const backdrop = document.querySelector('.modal-backdrop.fade.show');
      if (backdrop) backdrop.remove();
      this.element.remove();
      this.element = null;
    }
  }
}
