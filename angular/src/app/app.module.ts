import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PoliticaPrivacidadComponent } from './politica-privacidad/politica-privacidad.component';
import { CondicionesServicioComponent } from './condiciones-servicio/condiciones-servicio.component';
import { NavbarComponent } from './nav/navbar/navbar.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { ConcursosPageModule } from './concursos/concursos.module';
import { SharedModule } from './shared/shared.module';
// nuevo
import { AuthModule } from './modules/auth/auth.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './modules/auth/services/auth-interceptor.service';
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './services/global-error-handler';

import { FooterPostComponent } from './nav/footer/footer-post/footer-post.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterPostComponent,
    SidebarComponent,
    PoliticaPrivacidadComponent,
    CondicionesServicioComponent,
  ],
  exports:[
    FooterPostComponent,
  ]
  ,

  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    SharedModule,
    AppRoutingModule,
    ConcursosPageModule,
    AuthModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000'
    })
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
