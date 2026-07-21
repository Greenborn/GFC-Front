import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ConsoleLogService } from './console-log.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private injector: Injector
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
  }
}
