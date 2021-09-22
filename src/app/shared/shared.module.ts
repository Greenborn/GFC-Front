import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioImgComponent } from './usuario-img/usuario-img.component';
import { SearchBarComponent } from './search-bar/search-bar.component';



@NgModule({
  declarations: [
    UsuarioImgComponent,
    SearchBarComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [UsuarioImgComponent, SearchBarComponent],
})
export class SharedModule { }
