import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { MetricasAbmPage } from './metricas-abm.page';
import { MetricasAbmPageRoutingModule } from './metricas-abm-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MetricasAbmPageRoutingModule,
    SharedModule,
    MetricasAbmPage,
  ],
})
export class MetricasAbmPageModule {}
