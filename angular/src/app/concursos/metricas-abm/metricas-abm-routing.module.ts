import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MetricasAbmPage } from './metricas-abm.page';


const routes: Routes = [
  {
    path: '',
    component: MetricasAbmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MetricasAbmPageRoutingModule {}
