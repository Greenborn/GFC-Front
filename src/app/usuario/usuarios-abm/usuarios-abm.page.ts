import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../usuario.model';

import { AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SearchBarComponentAtributo, SearchBarComponentParams } from 'src/app/shared/search-bar/search-bar.component';

import { MenuAccionesComponent } from '../../shared/menu-acciones/menu-acciones.component';
import { Role } from 'src/app/models/role.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ProfileService } from 'src/app/services/profile.service';
import { User, UserLogged } from 'src/app/models/user.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage extends ApiConsumer implements OnInit  {

  mostrarFiltro: boolean = false;
  user: User = undefined;
  miembros: ProfileExpanded[] = [];
  miembrosOrig: ProfileExpanded[] = [];
  // miembros: Observable<ProfileExpanded[]>;
  // users: Observable<User[]>;
  // profiles: Profile[] = [];

  roles: Role[] = [];
  fotoclubs: Fotoclub[] = [];
  
  // usuariosFiltrados: Usuario[] = [];
  searchParams: SearchBarComponentParams;

  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'name', 
      valorMostrado: 'Nombre y apellido', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.title.toLowerCase().includes(query.toLowerCase())      
      callback: (c: ProfileExpanded, query: string) => `${c.name} ${c.last_name}`.match(new RegExp(`${query}`, 'i')) 
    },
    { 
      valor: 'username', 
      valorMostrado: 'Username', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.code.toLowerCase().includes(query.toLowerCase()) 
      callback: (c: ProfileExpanded, query: string) => c.user.username.match(new RegExp(`^${query}`, 'i'))
    }
  ];
  
  public funcionesOrdenamiento: Function[] = [];
  // public funcionesFiltrado: Function[] = [];
  public filtrado: any[] = [];

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
    public auth: AuthService,
    public rolificador: RolificadorService,
    public loadingController: LoadingController,
    private route: ActivatedRoute,
    public configService: ConfigService,
    public UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
    // this.funcionesOrdenamiento['fotoclub'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
    this.funcionesOrdenamiento['usuario'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
      const n1 = e1.last_name
      const n2 = e2.last_name
      
      return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
        (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
    }
    this.funcionesOrdenamiento['fotoclub'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
      const n1 = this.getFotoclubName(e1.fotoclub_id)
      const n2 = this.getFotoclubName(e2.fotoclub_id)
      
      return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
        (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
    }
    this.funcionesOrdenamiento['rol'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
      const n1 = this.getRoleType(e1.user.role_id)
      const n2 = this.getRoleType(e2.user.role_id)
      
      return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
        (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
    }

    this.filtrado['fotoclub'] = {
      options: {
        valueProp: 'id', 
        titleProp: 'name',
        queryParam: 'asociacion_id'
      },
      filterCallback: (p: ProfileExpanded, atributoValue: string) => {
        return p.fotoclub_id == parseInt(atributoValue)
      }
    }
    this.filtrado['rol'] = {
      options: {
        valueProp: 'id', 
        titleProp: 'type',
        queryParam: 'rol_id'
      },
      filterCallback: (p: ProfileExpanded, atributoValue: string) => {
        return p.user.role_id == parseInt(atributoValue)
      }
    }

    this.auth.user.then(u => {
      if (this.rolificador.isAdmin(u)) {
        this.atributosBusqueda.push({ 
          valor: 'fotoclub_id', 
          valorMostrado: 'Fotoclub / Agrupación', 
          // callback: (c: ContestResultExpanded, query: string) => c.image.code.toLowerCase().includes(query.toLowerCase()) 
          callback: (c: ProfileExpanded, query: string) => this.getFotoclubName(c.fotoclub_id).match(new RegExp(`^${query}`, 'i'))
        })
      }
    })

    // this.funcionesFiltrado['fotoclub'] = (p: ProfileExpanded, atributoValue: string) => {

    //   return p.fotoclub_id == parseInt(atributoValue)
    // }
    // this.funcionesFiltrado['role'] = (p: ProfileExpanded, atributoValue: string) => {

    //   return p.user.role_id == parseInt(atributoValue)
    // }
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  getTitulo(u: UserLogged) {
    const nombreUsuarios = this.rolificador.getNombreUsuarios(u.role_id)
    if (!this.rolificador.isAdmin(u)) {        
      // const p = this.profiles.find(p => p.id == u.profile_id)
      // if (p != undefined && this.fotoclubs.length > 0) {
      if (this.fotoclubs.length > 0) {
        return `${nombreUsuarios} del fotoclub ${this.fotoclubs.find(f => f.id == u.profile.fotoclub_id).name}`
      } else return ''
    } else return nombreUsuarios
  }
  
  // get titulo() {
  //   if (this.user != undefined) {
  //     if (this.user.role_id != 1) {
  //       const p = this.profiles.find(p => p.id == this.user.profile_id)
  //       if (p != undefined && this.fotoclubs.length > 0) {
  //         return `Concursantes del fotoclub ${this.fotoclubs.find(f => f.id == p.fotoclub_id).name}`
  //       } else return ''
  //     } else return 'Miembros'
  //   } else return ''
  // }

  getFotoclubName(fotoclub_id: number) {
    let name = ''
    // const p = this.profiles.find(e => e.id == profile_id)
    // console.log(p)
    // if (p != undefined) {
    let fc = this.fotoclubs.find(e => e.id == fotoclub_id)
    if (fc != undefined) name = fc.name
    // }
    return name
  }
  getRoleType(id: number) {
    const a = this.roles.find(e => e.id == id)
    return a != undefined ? a.type : ''
  }
  // getFullName(profile_id: number) {
  //   const a = this.profiles.find(e => e.id == profile_id)
  //   return a != undefined ? `${a.name} ${a.last_name}` : ''
  // }

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
  // get usuariosFiltrados() {
  //   if (this.user != undefined && this.profiles.length > 0) {
  //     if (this.user.role_id != 1) {
  //       const fc_id = this.profiles.find(p => p.id == this.user.profile_id).fotoclub_id
  //       return this.users.filter(u => this.profiles.find(p => p.id == u.profile_id).fotoclub_id == fc_id)
  //     } else return this.users
  //   } else return []

  //   // const q = this.searchQuery;
  //   // return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  // }

  async deleteUsuario(p: ProfileExpanded) {

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
            super.fetch<void>(() => this.profileService.delete(p.id)).subscribe(
              _ => {
                super.fetch<void>(() => this.userService.delete(p.user.id)).subscribe(_ => {
                  this.miembros.splice(
                    this.miembros.findIndex(m => m.id == p.id),
                    1
                  )
                })
              }, 
              async err => {
                this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
              }
            )
            // super.displayAlert('.')
            // console.log('delete usuario', id)
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarAcciones(ev: any, p: ProfileExpanded) {
    this.popover = await this.popoverCtrl.create({
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones: [
          {
            accion: (params: string[]) => this.router.navigate(params),
            params: ['/usuarios', 'editar', p.user.id],
            icon: 'create',
            label: 'Editar'
          },
          {
            accion: (params: number[]) => this.deleteUsuario(p),
            params: [],
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

    // this.route.queryParams.subscribe(params => {

    //   // console.log('detecting query params change', params)

    //   this.miembros = [...this.miembrosOrig]

    //   const filterCallbacks: {
    //     queryValue: string;
    //     callback: Function;
    //   }[] = [];

    //   for (const f of [this.filtrado['rol'], this.filtrado['fotoclub']]) {
    //     // console.log('analizando filter callback', f)
    //     if (params[f.options.queryParam] != undefined) {
    //       // console.log('agregando filter callback', f.options.queryParam)
    //       filterCallbacks.push({
    //         callback: f.filterCallback,
    //         queryValue: params[f.options.queryParam]
    //       })
    //     }
    //   }

    //   for (const f of filterCallbacks) {
    //     this.miembros = this.miembros.filter(p => f.callback(p, f.queryValue))
    //   }
    // });
    
    super.fetch<Role[]>( () => this.roleService.getAll()).subscribe(r => this.roles = r)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => this.fotoclubs = r)
  }

  async ionViewWillEnter() {
    // super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
    // this.loading = true
    // this.profiles = []
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Cargando...'
    })
    await loading.present()
    this.auth.user.then(u => {
      this.user = u
      // this.users = super.fetch<User[]>(() => this.userService.getAll('expand=profile'))
      // this.miembros = super.fetch<ProfileExpanded[]>(() => this.rolificador.getMiembros(u))
      
      super.fetch<ProfileExpanded[]>(() => this.rolificador.getMiembros(u)).subscribe(m => {
        this.miembros = m
        this.miembrosOrig = [...m]
        loading.dismiss();
        this.route.queryParams.subscribe(params => {

          // console.log('detecting query params change', params)
    
          this.miembros = [...this.miembrosOrig]
    
          const filterCallbacks: {
            queryValue: string;
            callback: Function;
          }[] = [];
    
          for (const f of [this.filtrado['rol'], this.filtrado['fotoclub']]) {
            // console.log('analizando filter callback', f)
            if (params[f.options.queryParam] != undefined) {
              // console.log('agregando filter callback', f.options.queryParam)
              filterCallbacks.push({
                callback: f.filterCallback,
                queryValue: params[f.options.queryParam]
              })
            }
          }
    
          for (const f of filterCallbacks) {
            this.miembros = this.miembros.filter(p => f.callback(p, f.queryValue))
          }
        });
      })
      // this.users = super.fetch<User[]>(() => this.rolificador.getUsers(u)).pipe(
      //   filter()
      // )
      // super.fetch<Profile[]>(() => this.rolificador.getProfiles(u)).subscribe(r => this.profiles = r)
      // if (this.rolificador.isAdmin(u)) {
      //   this.users = super.fetch<User[]>(() => this.userService.getAll())
      //   super.fetch<Profile[]>(() => this.profileService.getAll()).subscribe(r => this.profiles = r)
      // } else {

      // }
    })
    // super.fetch<User[]>(() => this.userService.getAll()).subscribe(r => this.users = r)
    // super.fetch<Profile[]>(() => this.profileService.getAll()).subscribe(r => {
    //   this.profiles = r
    //   // this.loading = false
    // })
  }

  // para implementar busqueda con la api (sobrescribe variable de usuarios)
  // async buscarUsuarios(searchQuery) {
  //   console.log(searchQuery)
  // }
}