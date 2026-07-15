import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { FotoclubsAbmPageRoutingModule } from './fotoclubs-abm-routing.module';

import { FotoclubsAbmPage } from './fotoclubs-abm.page';
import { SharedModule } from '../shared/shared.module';
import { FotoclubPostComponent } from './fotoclub-post/fotoclub-post.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FotoclubsAbmPageRoutingModule,
    SharedModule
  ],
  declarations: [FotoclubsAbmPage, FotoclubPostComponent]
})
export class FotoclubsAbmPageModule {}
