import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { NavbarComponent } from './navbar/navbar.component'
import { SidebarComponent } from './sidebar/sidebar.component';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [
    NavbarComponent,   
    SidebarComponent         
  ],
  imports: [
    CommonModule,
    AppRoutingModule // pq sino no reconoce RouterLink
  ],
  exports: [
    NavbarComponent,
    SidebarComponent
  ]
})
export class NavModule { }
