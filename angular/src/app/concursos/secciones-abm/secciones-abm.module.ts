import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SeccionesAbmPageRoutingModule } from './secciones-abm-routing.module';

import { SeccionesAbmPage } from './secciones-abm.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SeccionesAbmPageRoutingModule,
    SharedModule,
    SeccionesAbmPage,
  ],
})
export class SeccionesAbmPageModule {}
