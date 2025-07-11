import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { HerramientasPage, BusquedaFotografiasModalComponent } from './herramientas.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HerramientasPage
  }
];

@NgModule({
  declarations: [HerramientasPage, BusquedaFotografiasModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class HerramientasModule { } 