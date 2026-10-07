import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';

// Clave de sessionStorage: evita bucles de recarga si version.json queda desincronizado
const RELOAD_GUARD_KEY = 'gfc-reload-buildId';
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Compara el buildId embebido en el bundle con el publicado en /version.json.
 * Si el servidor tiene un build distinto, el cliente quedó con una versión vieja
 * (típicamente servida desde cache del navegador o del service worker) y se recarga
 * limpiando el service worker y los caches.
 */
@Injectable({ providedIn: 'root' })
export class VersionCheckService {
  private remoteBuildId: string | null = null;

  constructor(private router: Router) {}

  start(): void {
    // En desarrollo no hay version.json desplegado ni service worker
    if (!environment.production) return;

    this.check(true);
    setInterval(() => this.check(false), CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.check(false);
    });
    window.addEventListener('online', () => this.check(false));

    // Si hay una recarga pendiente, se aplica al navegar para no interrumpir un formulario a mitad de carga
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe(e => {
        if (this.remoteBuildId) this.reload(e.url);
      });
  }

  /** Lo usa el manejo de errores cuando falla la carga de un chunk lazy (build viejo referenciando archivos borrados). */
  checkAfterChunkError(): void {
    this.check(true);
  }

  private async check(immediate: boolean): Promise<void> {
    try {
      const res = await fetch(`version.json?ngsw-bypass=true&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;

      const remote = await res.json();
      if (!remote?.buildId || remote.buildId === environment.buildId) return;

      // Ya se recargó para esta versión y sigue igual: no insistir
      if (this.getGuard() === remote.buildId) return;

      this.remoteBuildId = remote.buildId;
      if (immediate || document.hidden) {
        this.reload();
      }
    } catch {
      // Sin red o JSON inválido: se reintenta en el próximo chequeo
    }
  }

  private async reload(targetUrl?: string): Promise<void> {
    const buildId = this.remoteBuildId;
    this.setGuard(buildId);
    await this.clearServiceWorkersAndCaches();

    // Cambiar el query fuerza una carga completa del documento (un cambio solo en el hash no recarga)
    const hash = targetUrl ? `#${targetUrl}` : location.hash;
    location.href = `${location.pathname}?_v=${encodeURIComponent(buildId ?? '')}${hash}`;
  }

  private async clearServiceWorkersAndCaches(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {
      // Si falla la limpieza igual recargamos; el guard evita bucles
    }
  }

  private getGuard(): string | null {
    try {
      return sessionStorage.getItem(RELOAD_GUARD_KEY);
    } catch {
      return null;
    }
  }

  private setGuard(buildId: string | null): void {
    try {
      if (buildId) sessionStorage.setItem(RELOAD_GUARD_KEY, buildId);
    } catch {
      // sessionStorage no disponible (modo privado estricto): sin guard
    }
  }
}
