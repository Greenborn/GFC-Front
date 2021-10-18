import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import {Location} from '@angular/common';

import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Role } from 'src/app/models/role.model';
import { RoleService } from 'src/app/services/role.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/models/profile.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-usuario-post',
  templateUrl: './usuario-post.page.html',
  styleUrls: ['./usuario-post.page.scss'],
})
export class UsuarioPostPage extends ApiConsumer implements OnInit {


  @ViewChild('sFotoclub') selectFotoclub: HTMLIonSelectElement;
  @ViewChild('sRol') selectRol: HTMLIonSelectElement;
  @ViewChild('f') formUsuario: HTMLFormElement;

  public usuario: User = this.userService.template;
  public profile: Profile = this.profileService.template;
  public fotoclubes: Fotoclub[] = []
  public roles: Role[] = []

  public isPost: boolean = true;
  public posting: boolean = false;
  public loading: boolean = false;
  public userLogged: User;
  public updatingSelect: boolean = false

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
    private profileService: ProfileService,
    private roleService: RoleService,
    private fotoclubService: FotoclubService,
    alertCtrl: AlertController,
    private location: Location
  ) { 
    super(alertCtrl)
  }

  // userIsAdmin(){ //agregado para evitar error de que auth no es publico
  //   // return this.auth.isAdmin();
  //   return this.user == undefined ? false : this.user.role_id == 1;
  // }

  get formTitle(): string {
    if (this.userLogged == undefined || this.loading) return ''
    const c = this.usuario;
    return  (c.id != null ? 'Editar ' : 'Agregar ') + 
              (c.id == this.userLogged.id ? 'perfil' : 
              (this.userLogged.role_id == 0 ? 'miembro' : 'concursante'))
  }
  get isAdmin(): boolean {
    return this.userLogged == undefined ? false : this.userLogged.role_id == 1
  }

  async ngOnInit() {
    super.fetch<Role[]>(() => this.roleService.getAll()).subscribe(r => this.roles = r)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => this.fotoclubes = r)

    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');
      if (id != null) {
        this.isPost = false
        this.loading = true
        super.fetch<User>(() => this.userService.get(parseInt(id))).subscribe(u => {
          this.usuario = u
          super.fetch<Profile>(() => this.profileService.get(u.profile_id)).subscribe(p => {
            this.profile = p
            this.loading = false
          })
        })
        
      } else {
        this.isPost = true
      }
    })
  }
  
  ionViewWillEnter() {
    // super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
    this.auth.user.then(u => {
      this.userLogged = u
      if (this.isPost) {
        this.updatingSelect = true
        console.log('si')
        this.usuario.role_id = 3 // los no admin cargan delegados (select rol desactivado)
        this.profile.fotoclub_id = u.profile.fotoclub_id
        setTimeout(() => this.updatingSelect = false, 420)
      }
    })
  }

  datosCargados() {
    // console.log(f.valid)
    const sin_cargar = this.selectFotoclub == undefined || this.selectRol == undefined
    const res = sin_cargar ? false : 
    this.formUsuario.valid && this.selectFotoclub.value != undefined && this.selectRol.value != undefined
    return res
  }

  async postUsuario(f: NgForm) {
    if (f.valid) {
      // console.log('posteando form', f.value, this.selectRol.value, this.selectFotoclub.value)
      
      const pm: Profile = {
        name: f.value.name, 
        last_name: f.value.last_name, 
        // fotoclub_id: f.value.fotoclub_id
        fotoclub_id: this.selectFotoclub.value
      }
      
      this.posting = true
      
      super.fetch<Profile>(() => this.profileService.post(pm, this.profile.id)).subscribe(
        p => {
          // console.log('posteado perfil', p)
          const um: User = {
            username: f.value.username,
            role_id: this.selectRol.value,
            // role_id: f.value.role_id,
            profile_id: p.id
          }
          // super.fetch<User>(() => this.userService.post(um, this.usuario.id)).subscribe(
          //   u => {
          //     this.posting = false
          //     console.log('exito post user', u)
              this.location.back()
              // this.router.navigate(['/usuarios']);
          //   },
          //   err => {
          //     this.posting = false
          //     console.log('posteado perfil', p)
          //     super.fetch<void>(() => this.profileService.delete(p.id)).subscribe(_ => {})
          //     super.displayAlert(`No se pudo ${this.usuario.id == undefined ? 'agregar' : 'editar'} el usuario. ${err.statusText}`)
          //   }
          // )
        },
        err => {
          this.posting = false
          console.log('error post profile', err)
          super.displayAlert(err.error[0].message)
        }
      )
    }
    else {
      console.log('Form usuario no valido:', f.value);
    }
  }
}
