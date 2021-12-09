import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursoDetailPageRoutingModule } from './concurso-detail-routing.module';

import { ConcursoDetailPage } from './concurso-detail.page';

import { SharedModule } from '../../shared/shared.module';
import { ConcursantesComponent } from './concursantes/concursantes.component';
import { JuecesComponent } from './jueces/jueces.component';
import { FotografiasComponent } from './fotografias/fotografias.component';
import { InformacionComponent } from './informacion/informacion.component';
import { ConcursoDetailService } from './concurso-detail.service';
import { ImagePostPage } from './image-post/image-post.page';
import { ImageReviewPage } from './image-review/image-review.page';
import { InscribirConcursanteComponent } from './inscribir-concursante/inscribir-concursante.component';
import { InscribirJuecesComponent } from './inscribir-jueces/inscribir-jueces.component';
import { VerFotografiasComponent } from './ver-fotografias/ver-fotografias.component';
// import { ConcursoTabsComponent } from './concurso-tabs/concurso-tabs.component';
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
    JuecesComponent,
    FotografiasComponent, 
    InformacionComponent,
    ImagePostPage, 
    ImageReviewPage,
    InscribirConcursanteComponent,
    InscribirJuecesComponent,
    VerFotografiasComponent
    // ConcursoTabsComponent
  ],
  providers: [ConcursoDetailService]
})
export class ConcursoDetailPageModule {}
