import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeccionesAbmPage } from './secciones-abm.page';

const routes: Routes = [
  {
    path: '',
    component: SeccionesAbmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeccionesAbmPageRoutingModule {}
