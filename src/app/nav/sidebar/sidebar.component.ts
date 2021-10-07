import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private Router: Router,
    public rolificador: RolificadorService
  ) { }

  ngOnInit() {}

  // isLoggedIn(){ //agregado para no tener error al querer usar la funcion de auth desde la vista
  //   return this.auth.loggedIn;
  // }
}
