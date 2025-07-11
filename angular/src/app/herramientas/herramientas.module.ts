import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HerramientasPage } from './herramientas.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HerramientasPage
  }
];

@NgModule({
  declarations: [HerramientasPage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class HerramientasModule { } 