import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursosPageRoutingModule } from './concursos-routing.module';

import { ConcursosPage } from './concursos.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursosPageRoutingModule,
    SharedModule
  ],
  declarations: [ConcursosPage]
})
export class ConcursosPageModule {}
