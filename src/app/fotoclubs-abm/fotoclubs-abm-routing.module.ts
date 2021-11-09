import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FotoclubsAbmPage } from './fotoclubs-abm.page';

const routes: Routes = [
  {
    path: '',
    component: FotoclubsAbmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FotoclubsAbmPageRoutingModule {}
