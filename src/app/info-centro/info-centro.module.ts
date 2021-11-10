import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoCentroPageRoutingModule } from './info-centro-routing.module';

import { InfoCentroPage } from './info-centro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoCentroPageRoutingModule
  ],
  declarations: [InfoCentroPage]
})
export class InfoCentroPageModule {}
