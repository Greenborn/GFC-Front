import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioImgComponent } from './usuario-img/usuario-img.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MenuAccionesComponent } from './menu-acciones/menu-acciones.component';
import { InputOjoComponent } from './input-ojo/input-ojo.component';


@NgModule({
  declarations: [
    UsuarioImgComponent,
    SearchBarComponent,
    MenuAccionesComponent,
    InputOjoComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [UsuarioImgComponent, SearchBarComponent, MenuAccionesComponent, InputOjoComponent, ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
