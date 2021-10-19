import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConcursantesComponent } from './concursantes/concursantes.component';

import { ConcursoDetailPage } from './concurso-detail.page';
import { FotografiasComponent } from './fotografias/fotografias.component';

const routes: Routes = [
  {
    path: '',
    component: ConcursoDetailPage,
    children: [
      {
        path: 'concursantes',
        component: ConcursantesComponent,
        // outlet: 'concurso'
      },
      {
        path: 'fotografias',
        component: FotografiasComponent,
        // outlet: 'concurso'
      },
      {
        path: '',
        redirectTo: 'concursantes',
        pathMatch: 'full'
      }
    ]
  },
  // {
  //   path: 'concursantes',
  //   component: ConcursantesComponent,
  //   outlet: 'concurso'
  // },
  // {
  //   path: 'fotografias',
  //   component: FotografiasComponent,
  //   outlet: 'concurso'
  // },
  // {
  //   path: 'agregar-foto',
  //   loadChildren: () => import('./image-post/image-post.module').then( m => m.ImagePostPageModule),
  //   pathMatch: 'full'
  // },
  // {
  //   path: 'image-review',
  //   loadChildren: () => import('./image-review/image-review.module').then( m => m.ImageReviewPageModule)
  // },
  // {
  //   path: 'concursantes',
  //   component: ConcursantesComponent
  // }



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursoDetailPageRoutingModule {}
