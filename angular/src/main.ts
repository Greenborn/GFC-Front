import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    console.error(err);
    document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;padding:20px;text-align:center;font-family:sans-serif;color:#555"><div><h2>Error al cargar la aplicación</h2><p style="color:#888">Por favor, recargá la página o intentá más tarde.</p></div></div>`;
  });
