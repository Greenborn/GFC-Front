import { Injectable } from '@angular/core';
import { Usuario } from '../usuario/usuario.model';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // private static usuario: Usuario = undefined;
  private static usuario: Usuario = {
    id: 0,
    username: 'Admin',
    email: 'admin@admin',
    img_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfn92Uz0WoedKHZbOdgPrHJKS9lP90htuueQ&usqp=CAU'
  };

  private static setUsuario(u: Usuario) {
    AuthService.usuario = u;
  }

  static loggedIn(): boolean {
    return AuthService.usuario != undefined;
  }
  loggedIn(): boolean {
    return AuthService.usuario != undefined;
  }

  static async login(username, password): Promise<boolean> {
    // fetch(...)
    const u = (await (new UsuarioService).getUsuarios()).find(u => u.username == username);
    if (u != undefined) {
      AuthService.setUsuario(u);
      return true;
    }
    else {
      return false;
    }
  }
  static async logout(): Promise<boolean> {
    AuthService.usuario = undefined;
    return true;
  }

  static getUsuario(): Usuario {
    // console.log('Get usuario ', UsuarioService.usuario);
    return { ...AuthService.usuario }
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
    AuthService.usuario = { 
      ...u
    };
    // console.log('Usuario editado ', UsuarioService.usuario);
    return true;
  }
}
