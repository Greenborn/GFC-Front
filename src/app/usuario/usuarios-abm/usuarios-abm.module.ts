import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosAbmPageRoutingModule } from './usuarios-abm-routing.module';

import { UsuariosAbmPage } from './usuarios-abm.page';
//componente de usuarios
import { TablaUsuariosComponent } from '../../tabla-usuarios/tabla-usuarios.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosAbmPageRoutingModule,
  ],
  declarations: [UsuariosAbmPage, TablaUsuariosComponent]
})
export class UsuariosAbmPageModule {


}
