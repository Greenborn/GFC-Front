import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursosPageRoutingModule } from './concursos-routing.module';

import { ConcursosPage } from './concursos.page';
import { RankingPage } from './ranking/ranking.page';
import { RankingDetalleModalComponent } from './ranking/ranking-detalle-modal/ranking-detalle-modal.component';
import { SharedModule } from '../shared/shared.module';
import { SeccionPostComponent } from './secciones-abm/seccion-post/seccion-post.component';
import { MetricasPostComponent } from './metricas-abm/metricas-post/metricas-post.component';
import { FotosAnioCardComponent } from './fotos-anio-card/fotos-anio-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursosPageRoutingModule,
    SharedModule
  ],
  declarations: [
    ConcursosPage, 
    RankingPage, 
    RankingDetalleModalComponent, 
    SeccionPostComponent, 
    MetricasPostComponent,
    FotosAnioCardComponent
  ]
})
export class ConcursosPageModule {}
