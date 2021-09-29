import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConcursoDetailPage } from './concurso-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ConcursoDetailPage
  },
  {
    path: 'agregar-foto',
    loadChildren: () => import('./image-post/image-post.module').then( m => m.ImagePostPageModule),
    pathMatch: 'full'
  },
  {
    path: 'image-review',
    loadChildren: () => import('./image-review/image-review.module').then( m => m.ImageReviewPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursoDetailPageRoutingModule {}
