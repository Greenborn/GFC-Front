import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageReviewPage } from './image-review.page';

const routes: Routes = [
  {
    path: '',
    component: ImageReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageReviewPageRoutingModule {}
