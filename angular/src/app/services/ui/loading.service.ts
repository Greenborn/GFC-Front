import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private element: HTMLElement | null = null;
  private progressElement: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private progressMessage: HTMLElement | null = null;
  private backdrop: HTMLElement | null = null;

  async present(message: string = 'Cargando...'): Promise<void> {
    this.dismiss();

    this.createBackdrop();

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

  presentProgress(title: string = 'Generando archivo...', message: string = ''): void {
    this.dismiss();

    this.createBackdrop();

    const container = document.createElement('div');
    container.className = 'd-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100';
    container.style.zIndex = '99999';

    const card = document.createElement('div');
    card.className = 'p-4 bg-white rounded-3 shadow';
    card.style.minWidth = '320px';
    card.style.maxWidth = '480px';

    const heading = document.createElement('div');
    heading.className = 'fw-semibold mb-2';
    heading.textContent = title;

    const progress = document.createElement('div');
    progress.className = 'progress mb-2';
    progress.style.height = '12px';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', '100');

    const bar = document.createElement('div');
    bar.className = 'progress-bar progress-bar-striped progress-bar-animated';
    bar.style.width = '0%';
    progress.appendChild(bar);

    const text = document.createElement('div');
    text.className = 'text-muted small';
    text.textContent = message || 'Iniciando...';

    card.appendChild(heading);
    card.appendChild(progress);
    card.appendChild(text);
    container.appendChild(card);
    document.body.appendChild(container);

    this.progressElement = container;
    this.progressBar = bar;
    this.progressMessage = text;
  }

  updateProgress(percent: number, message?: string): void {
    const value = Math.max(0, Math.min(100, Math.round(percent || 0)));

    if (this.progressBar) {
      this.progressBar.style.width = `${value}%`;
      this.progressBar.setAttribute('aria-valuenow', String(value));
    }

    if (message && this.progressMessage) {
      this.progressMessage.textContent = message;
    }
  }

  dismiss(): void {
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    if (this.progressElement) {
      this.progressElement.remove();
      this.progressElement = null;
      this.progressBar = null;
      this.progressMessage = null;
    }
  }

  private createBackdrop(): void {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'modal-backdrop fade show';
    document.body.appendChild(this.backdrop);
  }
}
