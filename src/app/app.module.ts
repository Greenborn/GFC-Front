import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// import { LoggedInGuard } from './guards/logged-in.guard'
import { NavbarComponent } from './nav/navbar/navbar.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { ConcursosPageModule } from './concursos/concursos.module';
import { SharedModule } from './shared/shared.module';
// nuevo
import { AuthModule } from './modules/auth/auth.module';
import { GestionModule } from './modules/gestion/gestion.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './modules/auth/services/auth-interceptor.service';

//componente de usuarios
// import { TablaUsuariosComponent } from './tabla-usuarios/tabla-usuarios.component'

// import { NavModule } from './nav/nav.module';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    ConcursosPageModule,
    SharedModule,
    AuthModule,
    // GestionModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
    // LoggedInGuard,
    [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptorService,
        multi: true
      }
    ]
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
