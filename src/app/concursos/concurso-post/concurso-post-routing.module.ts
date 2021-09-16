import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConcursoPostPage } from './concurso-post.page';

const routes: Routes = [
  {
    path: '',
    component: ConcursoPostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursoPostPageRoutingModule {}
