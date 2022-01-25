import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import { NavbarComponent } from './nav/navbar/navbar.component';
import { FooterComponent } from './nav/footer/footer.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { ConcursosPageModule } from './concursos/concursos.module';
import { SharedModule } from './shared/shared.module';
// nuevo
import { AuthModule } from './modules/auth/auth.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './modules/auth/services/auth-interceptor.service';

import { FooterPostComponent } from './nav/footer/footer-post/footer-post.component';
import { FormsModule } from '@angular/forms';

import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    FooterPostComponent,
    SidebarComponent,
  ],
  exports:[
    FooterPostComponent,
  ]
  ,
  entryComponents: [],
  imports: [
    FormsModule,
    BrowserModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    ConcursosPageModule,
    SharedModule,
    IonicSelectableModule,
    AuthModule
  ],
  providers: [
    FooterPostComponent,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, 
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
