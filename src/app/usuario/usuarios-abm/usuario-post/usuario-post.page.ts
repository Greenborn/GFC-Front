import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UsuarioService } from '../../usuario.service';
import { Usuario } from '../../usuario.model';
import { Api } from 'src/app/api.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-usuario-post',
  templateUrl: './usuario-post.page.html',
  styleUrls: ['./usuario-post.page.scss'],
})
export class UsuarioPostPage implements OnInit {


  @ViewChild('sFotoclub') selectFotoclub: HTMLIonSelectElement;
  @ViewChild('sRol') selectRol: HTMLIonSelectElement;
  @ViewChild('f') formUsuario: HTMLFormElement;

  public usuario: Usuario;
  public fotoclubes = []
  public roles = []

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private db: UsuarioService,
    private auth: AuthService
  ) { }

  get formTitle(): string {
    const u = this.auth.getUser()
    const c = this.usuario;
    return  (c.id != null ? 'Editar ' : 'Agregar ') + 
              (c.id == u.id ? 'perfil' : 
              (u.rol_id == 0 ? 'miembro' : 'concursante'))
    // return c == undefined || c.id != null ? 
    //   `Editar usuario ${c != undefined ? c.id : ''}` : 
    //   'Crear usuario'
  }

  async ngOnInit() {
    this.usuario = {...UsuarioService.usuarioTemplate()};

    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');

      let c = UsuarioService.usuarioTemplate();
      this.usuario = c;
      if (id != null) {
        c = await this.db.getUsuario(parseInt(id));
      }

      this.usuario = c;
    })

    const t = this
    Api.getAll('fotoclub').then(r => t.fotoclubes = r)
    Api.getAll('rol').then(r => t.roles = r)
  }
  // async ionViewWillEnter() {
  //   this.usuario = {...UsuarioService.usuarioTemplate()};
  // }

  datosCargados() {
    // console.log(f.valid)
    const sin_cargar = this.selectFotoclub == undefined || this.selectRol == undefined
    const res = sin_cargar ? false : 
    this.formUsuario.valid && this.selectFotoclub.value != undefined && this.selectRol.value != undefined
    // console.log(res)datosCargados
    return res
  }

  async postUsuario() {
    // if (f.valid) {
      // console.log('form usuario');
      const u = {
        id: this.usuario.id,
        rol_id: this.selectRol.value,
        fotoclub_id: this.selectFotoclub.value,
        ...this.formUsuario.value
      };
      // console.log('Posteando concurso: ', c);
      const id = await this.db.postUsuario(u);
      // if (id) {
        this.router.navigate(['/usuarios']);
      // }
    // }
    // else {
      // console.log('Form usuario no valido:', f.value);
    // }
  }
}
