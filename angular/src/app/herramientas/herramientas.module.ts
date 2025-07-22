import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { HerramientasPage } from './herramientas.page';
import { RouterModule, Routes } from '@angular/router';
import { CargaResultadosPage } from './carga-resultados/carga-resultados.page';
import { CargaResultadosModalComponent } from './carga-resultados-modal/carga-resultados-modal.component';

const routes: Routes = [
  {
    path: '',
    component: HerramientasPage
  },
  {
    path: 'busqueda-fotografias',
    loadChildren: () => import('./busqueda-fotografias/busqueda-fotografias.module').then(m => m.BusquedaFotografiasModule)
  },
  {
    path: 'carga-resultados',
    component: CargaResultadosPage
  }
];

@NgModule({
  declarations: [HerramientasPage, CargaResultadosPage, CargaResultadosModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class HerramientasModule { } 