import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptorService } from '../auth/services/auth-interceptor.service';
import { AuthGuard } from '../auth/guards/auth.guard';

const routes: Routes = [
  
  // {
  //   path: 'concursos',
  //   loadChildren: () => import('./pages/concursos/concursos.module').then( m => m.ConcursosPageModule),
  //   canActivate: [AuthGuard]
  // }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ], 
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
})
export class GestionModule { }
