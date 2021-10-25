import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConcursosPage } from './concursos.page';

const routes: Routes = [
  {
    path: '',
    component: ConcursosPage
  },
  // {
  //   path: 'concurso-detail',
  //   loadChildren: () => import('./concurso-detail/concurso-detail.module').then( m => m.ConcursoDetailPageModule)
  // },
  // {
  //   path: 'concurso-post',
  //   loadChildren: () => import('./concurso-post/concurso-post.module').then( m => m.ConcursoPostPageModule)
  // }
  // {
  //   path: 'secciones',
  //   component: AbmSeccionesComponent
  // },
  {
    path: 'secciones',
    loadChildren: () => import('./secciones-abm/secciones-abm.module').then( m => m.SeccionesAbmPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursosPageRoutingModule {}
