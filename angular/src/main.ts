import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    document.documentElement.classList.add('gfc-force-visible');
    document.dispatchEvent(new CustomEvent('gfc-ready'));
  })
  .catch(err => {
    document.documentElement.classList.add('gfc-force-visible');
    document.dispatchEvent(new CustomEvent('gfc-ready'));

    // Enviar error al servidor de logs (sin DI)
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
