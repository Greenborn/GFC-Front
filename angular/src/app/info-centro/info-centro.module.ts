import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoCentroPageRoutingModule } from './info-centro-routing.module';

import { InfoCentroPage } from './info-centro.page';
import { InfoCentroPostComponent } from './info-centro-post/info-centro-post.component';
import { SharedModule } from '../shared/shared.module';
import { PresentacionUltimoConcursoComponent } from './presentacion-ultimo-concurso/presentacion-ultimo-concurso.component';
import { PresentacionComisionDirectivaComponent } from './presentacion-comision-directiva/presentacion-comision-directiva.component';
import { PresentacionMiembrosComponent } from './presentacion-miembros/presentacion-miembros.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoCentroPageRoutingModule,
    SharedModule
  ],
  declarations: [
    InfoCentroPage, InfoCentroPostComponent, PresentacionUltimoConcursoComponent, 
    PresentacionComisionDirectivaComponent, PresentacionMiembrosComponent]
})
export class InfoCentroPageModule {}
