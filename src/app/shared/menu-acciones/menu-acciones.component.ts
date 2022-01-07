import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface MenuAccionesComponentAccion {
  accion: Function;
  params?: string[];
  icon: string;
  label: string;
}

@Component({
  selector: 'app-menu-acciones',
  templateUrl: './menu-acciones.component.html',
  styleUrls: ['./menu-acciones.component.scss'],
})
export class MenuAccionesComponent implements OnInit {

  // @Input() id: number;
  // @Input() abmPage: UsuariosAbmPage;

  @Input() acciones: MenuAccionesComponentAccion[] = [];
  @Input() onClick: Function = () => {};

  constructor(
    private router: Router
  ) { }

  action(action: Function, params: any[]) {
    action(params)
    this.onClick()
  }

  // editUsuario() {
  //   this.router.navigate(['/usuarios/editar/' + this.id])  
  // }

  ngOnInit() {}

}
