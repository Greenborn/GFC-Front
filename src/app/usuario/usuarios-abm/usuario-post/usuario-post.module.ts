import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioPostPageRoutingModule } from './usuario-post-routing.module';

import { UsuarioPostPage } from './usuario-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPostPageRoutingModule
  ],
  declarations: [UsuarioPostPage]
})
export class UsuarioPostPageModule {}
