import { Injectable } from '@angular/core';

import { Api } from '../api.service';
import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor() { }

  async getUsuarios(): Promise<Usuario[]> {
    return Api.getAll('usuario');
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
      img_url: undefined
    };
  }
}
