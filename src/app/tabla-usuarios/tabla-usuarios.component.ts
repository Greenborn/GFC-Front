import { Component, OnInit } from '@angular/core';
import { Usuario } from '../usuario/usuario.model';
import { UsuarioService } from '../usuario/usuario.service';


@Component({
  selector: 'app-tabla-usuarios',
  templateUrl: './tabla-usuarios.component.html',
  styleUrls: ['./tabla-usuarios.component.scss'],
})

export class TablaUsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  public searchQuery: string = '';
  constructor( private db: UsuarioService, ) { }

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


}
