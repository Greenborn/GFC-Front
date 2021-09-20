import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LoggedInGuard } from './guards/logged-in.guard'

//componente de usuarios
// import { TablaUsuariosComponent } from './tabla-usuarios/tabla-usuarios.component'

//componente navbar
import { NavbarComponent } from './navbar/navbar.component'
@NgModule({
  declarations: [
    AppComponent,
    //  TablaUsuariosComponent,
    NavbarComponent
    ],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, LoggedInGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
