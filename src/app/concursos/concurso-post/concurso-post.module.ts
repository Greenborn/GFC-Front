import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursoPostPageRoutingModule } from './concurso-post-routing.module';

import { ConcursoPostPage } from './concurso-post.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursoPostPageRoutingModule
  ],
  declarations: [ConcursoPostPage]
})
export class ConcursoPostPageModule {}
