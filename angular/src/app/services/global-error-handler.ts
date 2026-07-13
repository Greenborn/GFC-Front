import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { ConsoleLogService } from './console-log.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private injector: Injector,
    private ngZone: NgZone
  ) {}

  handleError(error: any): void {
    const logService = this.injector.get(ConsoleLogService);
    try {
      logService.sendLog(
        'error',
        error?.message || error?.toString() || 'Unknown error',
        {
          stack: error?.stack || null,
          accion: 'global-error',
          usuario_id: localStorage.getItem('usuario_id') || undefined
        }
      );
    } catch (e) {
      // Si falla el envío, no romper el flujo
    }
    console.error(error);

    // Mostrar error visible en pantalla para depuración
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const diag = document.getElementById('gfc-diag');
        if (diag) {
          diag.style.display = 'block';
          diag.textContent = 'Error: ' + (error?.message || error?.toString() || 'Error desconocido');
          diag.style.background = '#fcc';
          diag.style.borderColor = '#c00';
        }
      }, 100);
    });
  }
}
