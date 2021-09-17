import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosAbmPageRoutingModule } from './usuarios-abm-routing.module';

import { UsuariosAbmPage } from './usuarios-abm.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosAbmPageRoutingModule
  ],
  declarations: [UsuariosAbmPage]
})
export class UsuariosAbmPageModule {}
