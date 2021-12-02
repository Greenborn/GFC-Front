import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConcursosPage } from './concursos.page';

const routes: Routes = [
  {
    path: '',
    component: ConcursosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursosPageRoutingModule {}
