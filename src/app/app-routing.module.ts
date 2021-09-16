import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'concursos',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'concursos',
    children: [
      {
        path: '',
        loadChildren: () => import('./concursos/concursos.module').then( m => m.ConcursosPageModule)
      },
      {
        path: 'nuevo',
        loadChildren: () => import('./concursos/concurso-post/concurso-post.module').then( m => m.ConcursoPostPageModule)
      },
      {
        path: 'editar/:id',
        loadChildren: () => import('./concursos/concurso-post/concurso-post.module').then( m => m.ConcursoPostPageModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./concursos/concurso-detail/concurso-detail.module').then( m => m.ConcursoDetailPageModule)
      }
    ]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
