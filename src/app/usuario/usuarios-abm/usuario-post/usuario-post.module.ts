import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioPostPageRoutingModule } from './usuario-post-routing.module';

import { UsuarioPostPage } from './usuario-post.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPostPageRoutingModule,
    SharedModule
  ],
  declarations: [UsuarioPostPage]
})
export class UsuarioPostPageModule {}
