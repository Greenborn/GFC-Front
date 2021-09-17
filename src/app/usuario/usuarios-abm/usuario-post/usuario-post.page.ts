import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UsuarioService } from '../../usuario.service';
import { Usuario } from '../../usuario.model';

@Component({
  selector: 'app-usuario-post',
  templateUrl: './usuario-post.page.html',
  styleUrls: ['./usuario-post.page.scss'],
})
export class UsuarioPostPage implements OnInit {

  usuario: Usuario;

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: UsuarioService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.usuario = {...UsuarioService.usuarioTemplate()};
  }
  async ionViewWillEnter() {
    this.usuario = {...UsuarioService.usuarioTemplate()};
  }

  async postConcurso(f: NgForm) {
    if (f.valid) {
      // console.log(f.value);
      const u = {
        id: this.usuario.id,
        ...f.value,
      };
      // console.log('Posteando concurso: ', c);
      const result = await this.db.postUsuario(u);
      if (result) {
        this.router.navigate(['/usuarios']);
      }
    }
    else {
      console.log('Form usuario no valido:', f.value);
    }
  }
}
