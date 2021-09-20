import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosAbmPageRoutingModule } from './usuarios-abm-routing.module';

import { UsuariosAbmPage } from './usuarios-abm.page';
import { SharedModule } from 'src/app/shared/shared.module';
// import { UsuarioImgComponent } from 'src/app/components/usuario-img/usuario-img.component';
//componente de usuarios

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosAbmPageRoutingModule,
    SharedModule
  ],
  declarations: [UsuariosAbmPage]
})
export class UsuariosAbmPageModule {


}
