import { Injectable } from '@angular/core';

import { Api } from '../api.service';
import { AuthService } from '../auth/auth.service';
import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private auth: AuthService
  ) { }

  async getUsuarios(): Promise<Usuario[]> {
    let usuarios = await Api.getAll('usuario')

    if (this.auth.loggedIn() && !this.auth.isAdmin()) {
      usuarios = usuarios.filter(u => u.rol_id == 2 && u.fotoclub_id == this.auth.getUser().fotoclub_id)
    } 
    return usuarios;
  }

  async getUsuario(id: number): Promise<Usuario> {
    return Api.get('usuario', id);
  }

  async postUsuario(u: Usuario): Promise<number> {
    return Api.post('usuario', u);
  }

  async deleteUsuario(id: number): Promise<boolean> {
    return Api.delete('usuario', id);
  }

  static usuarioTemplate(): Usuario {
    return {
      id: undefined,
      username: undefined,
      email: undefined,
      rol_id: undefined,
      img_url: undefined,
      name: undefined,
      last_name: undefined,
      dni: undefined,
      fotoclub_id: undefined
    };
  }
}
