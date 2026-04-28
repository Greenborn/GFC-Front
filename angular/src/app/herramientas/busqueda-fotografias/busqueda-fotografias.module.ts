import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { BusquedaFotografiasPage } from './busqueda-fotografias.page';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: BusquedaFotografiasPage
  }
];

@NgModule({
  declarations: [BusquedaFotografiasPage],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class BusquedaFotografiasModule { } 