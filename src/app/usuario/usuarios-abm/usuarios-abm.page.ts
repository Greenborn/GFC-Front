import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../usuario.model';
import { UsuarioService } from '../usuario.service';

import { TablaUsuariosComponent } from '../../tabla-usuarios/tabla-usuarios.component'


@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage implements OnInit {
  @ViewChild("tabla-usuarios") tablaUsuariosComponent:TablaUsuariosComponent;

  usuarios: Usuario[] = [];
  private searchQuery: string = '';

  constructor(
    private db: UsuarioService
  ) { }

  get usuariosFiltrados() {
    // return [ ...this.usuarios ];
    const q = this.searchQuery;
    return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  }
  get usuarioProps() {
    return Object.keys(this.usuarios[0]);
  }

  async deleteUsuario(id: number) {
    const r = await this.db.deleteUsuario(id);
    if (r) {
      this.refresh();
    }
  }

  async editUsuario(id: number) {
    //TODO: 
   }

  async ngOnInit() {
    this.refresh();
  }

  async ionViewWillEnter() {
    this.refresh();
  }

  async refresh() {
    this.usuarios = await this.db.getUsuarios();
  }

  // para implementar busqueda con la api (sobrescribe variable de usuarios)
  // async buscarUsuarios(searchQuery) {
  //   console.log(searchQuery)
  // }
}