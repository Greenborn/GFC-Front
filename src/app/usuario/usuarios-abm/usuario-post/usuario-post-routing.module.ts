import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioPostPage } from './usuario-post.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioPostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioPostPageRoutingModule {}
