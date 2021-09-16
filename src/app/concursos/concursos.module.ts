import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursosPageRoutingModule } from './concursos-routing.module';

import { ConcursosPage } from './concursos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursosPageRoutingModule
  ],
  declarations: [ConcursosPage]
})
export class ConcursosPageModule {}
