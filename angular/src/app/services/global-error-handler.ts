import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ConsoleLogService } from './console-log.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    // Obtener instancia del servicio manualmente para evitar problemas de dependencias circulares
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
    // Mantener el comportamiento original: mostrar en consola
    console.error(error);
  }
}
