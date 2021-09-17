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
  },
  {
    path: 'perfil',
    loadChildren: () => import('./usuario/usuario.module').then( m => m.UsuarioPageModule)
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./usuario/usuarios-abm/usuarios-abm.module').then( m => m.UsuariosAbmPageModule)
  },  {
    path: 'notificaciones',
    loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
