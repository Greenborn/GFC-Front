import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioImgComponent } from './usuario-img/usuario-img.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MenuAccionesComponent } from './menu-acciones/menu-acciones.component';
import { InputOjoComponent } from './input-ojo/input-ojo.component';
import { BtnSortComponent } from './btn-sort/btn-sort.component';


@NgModule({
  declarations: [
    UsuarioImgComponent,
    SearchBarComponent,
    MenuAccionesComponent,
    InputOjoComponent,
    BtnSortComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    UsuarioImgComponent, 
    SearchBarComponent, 
    MenuAccionesComponent, 
    InputOjoComponent,
    BtnSortComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
