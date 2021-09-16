import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConcursoDetailPage } from './concurso-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ConcursoDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursoDetailPageRoutingModule {}
