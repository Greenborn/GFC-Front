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

  // usuario: Usuario = {
    static usuario: Usuario = {
      id: 0,
      username: 'Admin',
      email: 'admin@admin',
      img_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfn92Uz0WoedKHZbOdgPrHJKS9lP90htuueQ&usqp=CAU'
    }

  static getUsuario(): Usuario {
    // console.log('Get usuario ', UsuarioService.usuario);
    return { ...UsuarioService.usuario }
  // getUsuario(): Usuario {
    // console.log('Get usuario ', this.usuario);
    // return { ...this.usuario }
  }

  // async editUsuario(u: Usuario): Promise<boolean> {
    // console.log('editando usuario desde', this.usuario, 'a ', u);
    // this.usuario = { 
    // console.log('Usuario editado ', this.usuario);
  static async editUsuario(u: Usuario): Promise<boolean> {
    // console.log('editando usuario desde', UsuarioService.usuario, 'a ', u);
    UsuarioService.usuario = { 
      ...u
    };
    // console.log('Usuario editado ', UsuarioService.usuario);
    return true;
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
