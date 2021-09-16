import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursoDetailPageRoutingModule } from './concurso-detail-routing.module';

import { ConcursoDetailPage } from './concurso-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursoDetailPageRoutingModule,
  ],
  declarations: [ConcursoDetailPage]
})
export class ConcursoDetailPageModule {}
