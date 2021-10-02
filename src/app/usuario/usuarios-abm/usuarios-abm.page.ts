import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../usuario.model';

import { AlertController, PopoverController } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { SearchBarComponentParams } from 'src/app/shared/search-bar/search-bar.component';

import { MenuAccionesComponent } from '../../shared/menu-acciones/menu-acciones.component';
import { Role } from 'src/app/models/role.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ProfileService } from 'src/app/services/profile.service';
import { User } from 'src/app/models/user.model';
import { Profile } from 'src/app/models/profile.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage extends ApiConsumer implements OnInit  {

  mostrarFiltro: boolean = false;
  user: User = undefined;
  users: User[] = [];
  profiles: Profile[] = [];
  roles: Role[] = [];
  fotoclubs: Fotoclub[] = [];
  
  usuarios: Usuario[] = [];
  // usuariosFiltrados: Usuario[] = [];
  searchParams: SearchBarComponentParams;

  public loading: boolean = false;
  public searchQuery: string = '';
  private popover: HTMLIonPopoverElement = undefined;

  constructor(
    private fotoclubService: FotoclubService,
    private userService: UserService,
    private profileService: ProfileService,
    private roleService: RoleService,
    alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private auth: AuthService
  ) { 
    super('usuarios abm page', alertCtrl)
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }
  
  get titulo() {
    if (this.user != undefined) {
      if (this.user.role_id != 1) {
        const p = this.profiles.find(p => p.id == this.user.profile_id)
        if (p != undefined && this.fotoclubs.length > 0) {
          return `Concursantes del fotoclub ${this.fotoclubs.find(f => f.id == p.fotoclub_id).name}`
        } else return ''
      } else return 'Miembros'
    } else return ''
    // return this.user == undefined ? '' : 
    //   this.user.role_id == 1 ? 
    //     'Miembros' : 
    //     `Concursantes del fotoclub ${( || this.profileService.template).fotoclub_id}`
  }
  getFotoclubName(profile_id: number) {
    let name = ''
    const p = this.profiles.find(e => e.id == profile_id)
    if (p != undefined) {
      let fc = this.fotoclubs.find(e => e.id == p.fotoclub_id)
      if (fc != undefined) name = fc.name
    }
    return name
  }
  getRoleType(id: number) {
    const a = this.roles.find(e => e.id == id)
    return a != undefined ? a.type : ''
  }
  getFullName(profile_id: number) {
    const a = this.profiles.find(e => e.id == profile_id)
    return a != undefined ? `${a.name} ${a.last_name}` : ''
  }

  // filtrarUsuarios({ atributo, query }: SearchBarComponentParams) {
  //   this.usuariosFiltrados = this.usuarios.filter(u => u[atributo].substr(0, query.length) == query)
  // }
  async filtrarUsuarios(output: SearchBarComponentParams) {
    if (output != undefined) {
      console.log('buscando', output)
      let { atributo, query } = output;
      this.searchParams = output;
      // this.usuarios = (await this.usuarioSvc.getUsuarios()).filter(u => u[atributo].substr(0, query.length) == query);
    }
  }
  get usuariosFiltrados() {
    if (this.user != undefined && this.profiles.length > 0) {
      if (this.user.role_id != 1) {
        const fc_id = this.profiles.find(p => p.id == this.user.profile_id).fotoclub_id
        return this.users.filter(u => this.profiles.find(p => p.id == u.profile_id).fotoclub_id == fc_id)
      } else return this.users
    } else return []

    // const q = this.searchQuery;
    // return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  }

  async deleteUsuario(id: number) {

    if (this.popover != undefined) {
      this.popoverCtrl.dismiss(this.popover);
      this.popover = undefined
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar borrado',
      message: 'Cuidado',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Confirmar',
          handler: async () => {
            // super.fetch<void>(() => this.userService.delete(id)).subscribe(_ => this.ionViewWillEnter())
            super.displayAlert('.')
            console.log('delete usuario', id)

          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarAcciones(ev: any, id: number) {
    this.popover = await this.popoverCtrl.create({
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones: [
          {
            accion: (params: string[]) => this.router.navigate(params),
            params: ['/usuarios', 'editar', id],
            icon: 'create',
            label: 'Editar'
          },
          {
            accion: (params: number[]) => this.deleteUsuario(params[0]),
            params: [id],
            icon: 'trash',
            label: 'Borrar'
          }
        ]
      },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
      // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    });
    await this.popover.present();

    
    this.popover.onDidDismiss().then(_ => this.popover = undefined)
    // const t = this;
    // this.router.events.subscribe() // dismiss popover cuando cambie de ruta
    const s = this.router.events
    // .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(async (e) => {
      if (e instanceof NavigationEnd) {
        if (this.popover != undefined) {
          await this.popoverCtrl.dismiss(this.popover);
          this.popover = undefined
        }
        s.unsubscribe();
      }
    });
  }

  async ngOnInit() {
    super.fetch<Role[]>( () => this.roleService.getAll()).subscribe(r => this.roles = r)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => this.fotoclubs = r)
  }

  async ionViewWillEnter() {
    // super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
    this.loading = true
    this.auth.user.then(u => this.user = u)
    this.users = this.profiles = []
    super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
    super.fetch<Profile[]>(() => this.profileService.getAll()).subscribe(r => {
      this.profiles = r
      this.loading = false
    })
  }

  // para implementar busqueda con la api (sobrescribe variable de usuarios)
  // async buscarUsuarios(searchQuery) {
  //   console.log(searchQuery)
  // }
}