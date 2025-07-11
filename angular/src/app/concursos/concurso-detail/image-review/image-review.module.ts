import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageReviewPageRoutingModule } from './image-review-routing.module';

import { ImageReviewPage } from './image-review.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageReviewPageRoutingModule
  ],
  declarations: [ImageReviewPage]
})
export class ImageReviewPageModule {}
