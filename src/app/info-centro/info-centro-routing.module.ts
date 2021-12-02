import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoCentroPage } from './info-centro.page';

const routes: Routes = [
  {
    path: '',
    component: InfoCentroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoCentroPageRoutingModule {}
