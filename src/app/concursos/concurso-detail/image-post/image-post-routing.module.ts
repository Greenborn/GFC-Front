import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImagePostPage } from './image-post.page';

const routes: Routes = [
  {
    path: '',
    component: ImagePostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImagePostPageRoutingModule {}
