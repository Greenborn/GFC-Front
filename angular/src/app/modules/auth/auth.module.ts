import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { LoginViewComponent } from './components/login-view/login-view.component';
import { RecuperarPasswordSolicitudComponent } from './components/recuperar-password/recuperar-password-solicitud.component';
import { RecuperarPasswordCodigoComponent } from './components/recuperar-password/recuperar-password-codigo.component';
import { RecuperarPasswordExitoComponent } from './components/recuperar-password/recuperar-password-exito.component';

import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule }   from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: 'login',
    component: LoginViewComponent,
    // loadChildren: () => import('./components/login-view/login-view.component').then(c => LoginViewComponent)
  },
  {
    path: 'recuperar-password',
    children: [
      {
        path: '',
        component: RecuperarPasswordSolicitudComponent
      },
      {
        path: 'codigo',
        component: RecuperarPasswordCodigoComponent
      },
      {
        path: 'exito',
        component: RecuperarPasswordExitoComponent
      }
    ]
  }
];


@NgModule({
  declarations: [
    LoginViewComponent,
    RecuperarPasswordSolicitudComponent,
    RecuperarPasswordCodigoComponent,
    RecuperarPasswordExitoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  providers: [
    AuthGuard
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthModule { }
