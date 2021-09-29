import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImagePostPageRoutingModule } from './image-post-routing.module';

import { ImagePostPage } from './image-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImagePostPageRoutingModule
  ],
  declarations: [ImagePostPage]
})
export class ImagePostPageModule {}
