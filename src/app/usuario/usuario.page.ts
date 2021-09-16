import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario.model';
import { UsuarioService } from './usuario.service';

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
    this.usuario = UsuarioService.getUsuario();
    // this.usuario = this.db.getUsuario();
  }
  ionViewWillEnter() {
    this.usuario = UsuarioService.getUsuario();
    // this.usuario = this.db.getUsuario();
    console.log('Por entrar a vista con usuario ', this.usuario)
  }

}
