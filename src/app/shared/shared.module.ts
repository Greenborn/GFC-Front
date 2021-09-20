import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioImgComponent } from './usuario-img/usuario-img.component';



@NgModule({
  declarations: [
    UsuarioImgComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [UsuarioImgComponent],
})
export class SharedModule { }
