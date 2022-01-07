import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InfoCentroPageRoutingModule } from './info-centro-routing.module';

import { InfoCentroPage } from './info-centro.page';
import { InfoCentroPostComponent } from './info-centro-post/info-centro-post.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoCentroPageRoutingModule,
    SharedModule
  ],
  declarations: [InfoCentroPage, InfoCentroPostComponent]
})
export class InfoCentroPageModule {}
