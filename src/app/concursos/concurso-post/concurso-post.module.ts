import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConcursoPostPageRoutingModule } from './concurso-post-routing.module';

import { ConcursoPostPage } from './concurso-post.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { ContestRecordsComponent } from '../concurso-detail/contest-records/contest-records.component';
import { ContestRecordFormComponent } from '../concurso-detail/contest-records/contest-record-form/contest-record-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConcursoPostPageRoutingModule,
    SharedModule
  ],
  declarations: [ConcursoPostPage, ContestRecordsComponent, ContestRecordFormComponent]
})
export class ConcursoPostPageModule {}
