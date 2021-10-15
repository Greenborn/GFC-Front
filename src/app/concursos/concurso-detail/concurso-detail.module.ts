import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursoDetailPageRoutingModule } from './concurso-detail-routing.module';

import { ConcursoDetailPage } from './concurso-detail.page';

import { SharedModule } from '../../shared/shared.module';
import { ConcursantesComponent } from './concursantes/concursantes.component';
import { FotografiasComponent } from './fotografias/fotografias.component';
import { ConcursoDetailService } from './concurso-detail.service';
import { ImagePostPage } from './image-post/image-post.page';
import { ImageReviewPage } from './image-review/image-review.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursoDetailPageRoutingModule,
    SharedModule 
  ],
  declarations: [
    ConcursoDetailPage, 
    ConcursantesComponent, 
    FotografiasComponent, 
    ImagePostPage, 
    ImageReviewPage
  ],
  providers: [ConcursoDetailService]
})
export class ConcursoDetailPageModule {}
