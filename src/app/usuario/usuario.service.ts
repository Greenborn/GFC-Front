import { Injectable } from '@angular/core';

import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  static usuario: Usuario = {
  // usuario: Usuario = {
    id: 0,
    username: 'Admin',
    email: 'admin@admin',
    img_url: ''
  }

  constructor() { }

  static getUsuario(): Usuario {
  // getUsuario(): Usuario {
    console.log('Get usuario ', UsuarioService.usuario);
    // console.log('Get usuario ', this.usuario);
    return { ...UsuarioService.usuario }
    // return { ...this.usuario }
  }

  static async editUsuario(u: Usuario): Promise<boolean> {
  // async editUsuario(u: Usuario): Promise<boolean> {
    console.log('editando usuario desde', UsuarioService.usuario, 'a ', u);
    // console.log('editando usuario desde', this.usuario, 'a ', u);
    UsuarioService.usuario = { 
    // this.usuario = { 
      ...u,
      img_url: ''
    };
    console.log('Usuario editado ', UsuarioService.usuario);
    // console.log('Usuario editado ', this.usuario);
    return true;
  }

  // static usuarioTemplate(): Usuario {
  //   return {
  //     id: undefined,
  //     username: undefined,
  //     email: undefined,
  //     img_url: undefined
  //   };
  // }
}
