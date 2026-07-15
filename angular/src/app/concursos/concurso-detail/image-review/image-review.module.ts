import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ImageReviewPageRoutingModule } from './image-review-routing.module';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ImageReviewPageRoutingModule
  ],
  declarations: []
})
export class ImageReviewPageModule {}
