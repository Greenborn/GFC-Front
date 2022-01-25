import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConcursantesComponent } from './concursantes/concursantes.component';

import { ConcursoDetailPage } from './concurso-detail.page';
import { FotografiasComponent } from './fotografias/fotografias.component';
import { InformacionComponent } from './informacion/informacion.component';
import { JuecesComponent } from './jueces/jueces.component';

const routes: Routes = [
  {
    path: '',
    component: ConcursoDetailPage,
    children: [
      {
        path: 'concursantes', component: ConcursantesComponent,      
      },
      {
        path: 'fotografias',  component: FotografiasComponent,
      },
      {
        path: 'jueces',       component: JuecesComponent,
      },
      {
        path: 'informacion',  component: InformacionComponent,
      },
      {
        path: '',   redirectTo: 'informacion',  pathMatch: 'full'
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursoDetailPageRoutingModule {}
