import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
// import { LoggedInGuard } from './guards/logged-in.guard';
import { AuthGuard } from './modules/auth/guards/auth.guard';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'concursos',
  //   pathMatch: 'full'
  // },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'concursos',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./concursos/concursos.module').then( m => m.ConcursosPageModule)
      },
      {
        path: 'nuevo',
        canActivate: [AuthGuard],
        loadChildren: () => import('./concursos/concurso-post/concurso-post.module').then( m => m.ConcursoPostPageModule)
      },
      {
        path: 'editar/:id',
        canActivate: [AuthGuard],
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
    canActivate: [AuthGuard],
    loadChildren: () => import('./usuario/usuario.module').then( m => m.UsuarioPageModule)
  },
  {
    path: 'usuarios',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./usuario/usuarios-abm/usuarios-abm.module').then( m => m.UsuariosAbmPageModule)
      },
      {
        path: 'nuevo',
        loadChildren: () => import('./usuario/usuarios-abm/usuario-post/usuario-post.module').then( m => m.UsuarioPostPageModule)
      },
      {
        path: 'editar/:id',
        loadChildren: () => import('./usuario/usuarios-abm/usuario-post/usuario-post.module').then( m => m.UsuarioPostPageModule)
      }
  ]
},
{
  path: 'notificaciones',
  canActivate: [AuthGuard],
  loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
},
  {
    path: 'organizaciones',
    loadChildren: () => import('./fotoclubs-abm/fotoclubs-abm.module').then( m => m.FotoclubsAbmPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./info-centro/info-centro.module').then( m => m.InfoCentroPageModule),
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadChildren: () => import('./usuario/usuarios-abm/usuario-post/usuario-post.module').then( m => m.UsuarioPostPageModule),
    pathMatch: 'full'
  },

  // {
  //   path: 'login',
  //   loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  // }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules, 
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
