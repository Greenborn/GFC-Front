import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { ImagePostPageRoutingModule } from './image-post-routing.module';

// import { ImagePostPage } from './image-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ImagePostPageRoutingModule
  ],
  // declarations: [ImagePostPage]
})
export class ImagePostPageModule {}
