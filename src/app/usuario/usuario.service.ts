import { Injectable } from '@angular/core';

import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuarios: Usuario[] = [
    {
      id: 0,
      username: 'Admin',
      email: 'admin@admin',
      img_url: ''
    },
    {
      id: 1,
      username: 'Admin2',
      email: 'admin2@admin2',
      img_url: ''
    }
  ];

  constructor() { }

  async getUsuarios(): Promise<Usuario[]> {
    return [ ...this.usuarios ];
  }

  async postUsuario(u: Usuario): Promise<boolean> {
    let id = Math.floor(Math.random()*10**10);
    u.id = id;
    this.usuarios.push({ ...u });
    return true;
  }

  async deleteUsuario(id: number): Promise<boolean> {
    const i = this.usuarios.findIndex(u => u.id == id);
    if (i != -1) {
      this.usuarios.splice(i, 1);
      return true;
    }
    else {
      return false;
    }
  }

  // usuario: Usuario = {
    static usuario: Usuario = {
      id: 0,
      username: 'Admin',
      email: 'admin@admin',
      img_url: ''
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
      ...u,
      img_url: ''
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
