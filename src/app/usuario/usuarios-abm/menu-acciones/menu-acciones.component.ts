import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosAbmPage } from '../usuarios-abm.page';

@Component({
  selector: 'app-menu-acciones',
  templateUrl: './menu-acciones.component.html',
  styleUrls: ['./menu-acciones.component.scss'],
})
export class MenuAccionesComponent implements OnInit {

  @Input() id: number;
  @Input() abmPage: UsuariosAbmPage;

  constructor(
    private router: Router
  ) { }

  editUsuario() {
    this.router.navigate(['/usuarios/editar/' + this.id])  
  }

  ngOnInit() {}

}
