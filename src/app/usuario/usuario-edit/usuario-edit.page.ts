import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/auth/auth.service';
import { Usuario } from '../usuario.model';

@Component({
  selector: 'app-usuario-edit',
  templateUrl: './usuario-edit.page.html',
  styleUrls: ['./usuario-edit.page.scss'],
})
export class UsuarioEditPage implements OnInit {

  usuario: Usuario;

  constructor(
    // private db: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
    this.usuario = AuthService.getUsuario();
    // this.usuario = this.db.getUsuario();
  }
  ionViewWillEnter() {
    this.usuario = AuthService.getUsuario();
    // this.usuario = this.db.getUsuario();
  }
  
  async editUsuario(f: NgForm) {
    if (f.valid) {
      // console.log(f.value);
      const u = {
        id: this.usuario.id,
        ...f.value
      };
      // console.log('Posteando concurso: ', c);
      const result = await AuthService.editUsuario(u);
      // const result = await this.db.editUsuario(u);
      if (result) {
        this.router.navigate(['/perfil']);
      }
      else {}
    }
    else {
      console.log('Form usuario no valido:', f.value);
    }
  }
}
