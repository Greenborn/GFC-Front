import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuarioImgComponent } from './usuario-img/usuario-img.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { MenuAccionesComponent } from './menu-acciones/menu-acciones.component';
import { InputOjoComponent } from './input-ojo/input-ojo.component';
import { BtnSortComponent } from './btn-sort/btn-sort.component';
import { ThSortComponent } from './th-sort/th-sort.component';
import { BtnPostComponent } from './btn-post/btn-post.component';
import { SearchableSelectComponent } from './searchable-select/searchable-select.component';
import { SlidesComponent } from './slides/slides.component';
import { InfiniteScrollDirective } from './infinite-scroll.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UsuarioImgComponent,
    SearchBarComponent,
    SearchableSelectComponent,
    MenuAccionesComponent,
    InputOjoComponent,
    BtnSortComponent,
    ThSortComponent,
    BtnPostComponent,
    SlidesComponent,
    InfiniteScrollDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    UsuarioImgComponent, 
    SearchBarComponent, 
    SearchableSelectComponent,
    MenuAccionesComponent, 
    InputOjoComponent,
    BtnSortComponent,
    ThSortComponent,
    BtnPostComponent,
    SlidesComponent,
    InfiniteScrollDirective
  ],
})
export class SharedModule { }
