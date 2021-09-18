import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Usuario } from './usuario.model';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage implements OnInit {

  usuario: Usuario;

  constructor(
    // private db: UsuarioService
  ) { }

  ngOnInit() {
    this.usuario = AuthService.getUsuario();
    // this.usuario = this.db.getUsuario();
  }
  ionViewWillEnter() {
    this.usuario = AuthService.getUsuario();
    // this.usuario = this.db.getUsuario();
    // console.log('Por entrar a vista con usuario ', this.usuario)
  }

}
