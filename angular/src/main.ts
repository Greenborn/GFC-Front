import { enableProdMode, ErrorHandler, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, withHashLocation, PreloadAllModules } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { withInterceptors, provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { authInterceptorFn } from './app/modules/auth/services/auth-interceptor.fn';
import { GlobalErrorHandler } from './app/services/global-error-handler';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    provideRouter(routes, withHashLocation(), withPreloading(PreloadAllModules)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000'
    }),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
  ]
})
  .then(() => {
    document.documentElement.classList.add('gfc-force-visible');
    document.dispatchEvent(new CustomEvent('gfc-ready'));
  })
  .catch(err => {
    document.documentElement.classList.add('gfc-force-visible');
    document.dispatchEvent(new CustomEvent('gfc-ready'));

    const LOG_URL = 'https://debug.greenborn.com.ar/api/console-log';
    const LOG_KEY = 'o2fSFJNal96tcARiN5ueYzeBmpboC7CJqtddGvYfpZqUDujzqWu272VMquA9Z2A5NdS9vXOXX2w31J5V8uDBTXLG0CLfcWLRsW48K';
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LOG_KEY}` },
      body: JSON.stringify({
        nivel: 'error',
        mensaje: err?.message || err?.toString() || 'Error desconocido en bootstrap',
        datos: {
          accion: 'bootstrap-error',
          stack: err?.stack || null,
          timestamp: new Date().toISOString(),
          modulo: 'angular-app'
        }
      })
    }).catch(() => {});
  });
