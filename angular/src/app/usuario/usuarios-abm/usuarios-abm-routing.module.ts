import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosAbmPage } from './usuarios-abm.page';

const routes: Routes = [
  {
    path: '',
    component: UsuariosAbmPage
  },
  // {
  //   path: 'nuevo',
  //   loadChildren: () => import('./usuario-post/usuario-post.module').then( m => m.UsuarioPostPageModule)
  // },
  // {
  //   path: 'editar/:id',
  //   loadChildren: () => import('./usuario-post/usuario-post.module').then( m => m.UsuarioPostPageModule)
  // }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosAbmPageRoutingModule {}
