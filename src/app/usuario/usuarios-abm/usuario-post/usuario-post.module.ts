import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioPostPageRoutingModule } from './usuario-post-routing.module';

import { UsuarioPostPage } from './usuario-post.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ConfirmUserComponent } from './confirm-user/confirm-user.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPostPageRoutingModule,
    SharedModule
  ],
  declarations: [
    UsuarioPostPage, 
    ConfirmUserComponent,
    ChangePasswordComponent
  ]
})
export class UsuarioPostPageModule {}
