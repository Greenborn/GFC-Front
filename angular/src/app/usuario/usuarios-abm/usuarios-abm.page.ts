import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavigationEnd, Router } from '@angular/router';
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
import { filter } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { LoadingService } from 'src/app/services/ui/loading.service';
import axios from 'axios';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage extends ApiConsumer implements OnInit  {

  user: User = undefined;
  miembros: ProfileExpanded[] = [];
  miembrosOrig: ProfileExpanded[] = [];
  roles: Role[] = [];
  fotoclubs: Fotoclub[] = [];
  comisiones: String[] = [];

  searchParams: SearchBarComponentParams;

  public getUserId(e:any){
    if (e == null){ return ''; }
    return e.id;
  }

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
  public filtrado: any[] = [];

  public loading: boolean = false;
  public searchQuery: string = '';
  private popover: any = undefined;

  constructor(
    private fotoclubService: FotoclubService,
    private userService: UserService,
    private profileService: ProfileService,
    private roleService: RoleService,
    alertCtrl: AlertService,
    private router: Router,
    public auth: AuthService,
    public rolificador: RolificadorService,
    public loadingService: LoadingService,
    public configService: ConfigService,
    public UIUtilsService: UiUtilsService
  ) {
    super(alertCtrl)
    this.funcionesOrdenamiento['usuario'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
      const n1 = e1.last_name
      const n2 = e2.last_name

      return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) :
        (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
    }
    this.funcionesOrdenamiento['executive_rol'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
      const n1 = e1.executive_rol == null ? '' : e1.executive_rol
      const n2 = e2.executive_rol == null ? '' : e2.executive_rol
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
    this.funcionesOrdenamiento['estado'] = (e1: ProfileExpanded, e2: ProfileExpanded, creciente: boolean) => {
      const s1 = e1.user && typeof e1.user.status === 'number' ? e1.user.status : 1
      const s2 = e2.user && typeof e2.user.status === 'number' ? e2.user.status : 1
      return creciente ? (s1 < s2 ? -1 : (s1 == s2 ? 0 : 1)) :
        (s1 > s2 ? -1 : (s1 == s2 ? 0 : 1))
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

  }

  getTitulo(u: UserLogged) {
    const nombreUsuarios = this.rolificador.getNombreUsuarios(u.role_id)
    if (!this.rolificador.isAdmin(u)) {
      if (this.fotoclubs.length > 0) {
        return `${nombreUsuarios} del fotoclub ${this.fotoclubs.find(f => f.id == u.profile.fotoclub_id).name}`
      } else return ''
    } else return nombreUsuarios
  }

  getFotoclubName(fotoclub_id: number) {
    let name = ''
    let fc = this.fotoclubs.find(e => e.id == fotoclub_id)
    if (fc != undefined) name = fc.name
    return name
  }
  getRoleType(id: number) {
    const a = this.roles.find(e => e.id == id)
    return a != undefined ? a.type : ''
  }
  private sanitizeSearchQuery(query: string): string {
    if (query == undefined || query == null) {
      return '';
    }
    let cleaned = query.toString().trim().substring(0, 100);
    cleaned = cleaned.replace(/<|>|"|'|;|\\|\||%|`|\u0000/g, '');
    cleaned = cleaned.replace(/--|\/\*|\*\//g, '');
    return cleaned;
  }

  async buscarUsuarios() {
    const term = this.sanitizeSearchQuery(this.searchQuery);
    await this.loadMiembros(term);
  }

  private async loadMiembros(searchTerm: string = '') {
    this.auth.user.then(u => {
      this.user = u;
      super.fetch<ProfileExpanded[]>(() => this.rolificador.getMiembros(u, searchTerm)).subscribe(m => {
        this.miembros = m;
        this.miembrosOrig = [...m];
      });
    });
  }

  async toggleUsuarioStatus(p: ProfileExpanded) {
    if (!p.user || p.user.id == null) {
      await this.UIUtilsService.mostrarError({ message: 'El perfil no tiene usuario asociado.' });
      return;
    }

    const currentStatus = typeof p.user.status === 'number' ? p.user.status : 1;
    const newStatus = currentStatus === 1 ? 0 : 1;
    const confirmHeader = newStatus === 0 ? 'Confirmar deshabilitación' : 'Confirmar habilitación';
    const confirmMessage = newStatus === 0 
      ? 'Se procederá a deshabilitar al usuario. No se elimina para preservar la vinculación con su contenido. Al deshabilitar se invalida el access_token y no podrá acceder al sistema.'
      : 'Se procederá a habilitar al usuario. Podrá volver a acceder al sistema.';

    await this.UIUtilsService.mostrarAlert({
      header: confirmHeader,
      message: confirmMessage
      }, 
      async () => {
        try {
          const url = `${this.configService.nodeApiBaseUrl}disable_user`;
          const body = { id: p.user.id, status: newStatus };
          const r = (await axios.post(url, body)).data;
          const message = r && r.message ? r.message : 'Usuario deshabilitado';
          await this.UIUtilsService.mostrarAlert({ header: 'Acción realizada', message, buttons: [{ text: 'OK', role: 'cancel' }] });
          p.user.status = newStatus;
          const idx = this.miembros.findIndex(m => m.id == p.id);
          if (idx >= 0 && this.miembros[idx].user) this.miembros[idx].user.status = newStatus;
        } catch (err: any) {
          const msg = err?.error?.message || 'Error al deshabilitar usuario';
          await this.UIUtilsService.mostrarError({ message: msg });
        }
      }
    )
  }

  async mostrarAcciones(ev: any, p: ProfileExpanded) {
    await this.UIUtilsService.mostrarModal(MenuAccionesComponent, {
      acciones: [
        {
          accion: (params: string[]) => this.router.navigate(params),
          params: ['/usuarios', 'editar', p.user.id],
          icon: 'create',
          label: 'Editar'
        },
        {
          accion: (params: number[]) => this.toggleUsuarioStatus(p),
          params: [],
          icon: (p.user && p.user.status === 0) ? 'checkmark-circle' : 'remove-circle',
          label: (p.user && p.user.status === 0) ? 'Habilitar' : 'Deshabilitar'
        }
      ]
    });
  }

  async ngOnInit() {
    super.fetch<Role[]>( () => this.roleService.getAll()).subscribe(r => this.roles = r)
    super.fetch<Fotoclub[]>(() => this.fotoclubService.getAll()).subscribe(r => {
      this.fotoclubs = r
      this.cargarMiembros()
    })
  }

  private async cargarMiembros() {
    this.auth.user.then(u => {
      if (!u) return
      this.user = u
      super.fetch<ProfileExpanded[]>(() => this.rolificador.getMiembros(u, this.sanitizeSearchQuery(this.searchQuery))).subscribe(m => {
        this.miembros = m
        this.miembrosOrig = [...m]
      })
    })
  }

  async ionViewWillEnter() {
    this.cargarMiembros()
  }

}
