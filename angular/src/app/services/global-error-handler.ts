import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ConsoleLogService } from './console-log.service';
import { VersionCheckService } from './version-check.service';

// Errores típicos al cargar un chunk lazy que ya no existe tras un deploy
const CHUNK_ERROR_RE = /ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed/i;

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private injector: Injector
  ) {}

  handleError(error: any): void {
    if (CHUNK_ERROR_RE.test(`${error?.name ?? ''} ${error?.message ?? ''}`)) {
      this.injector.get(VersionCheckService).checkAfterChunkError();
    }

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
