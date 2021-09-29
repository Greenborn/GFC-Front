import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../usuario.model';
import { UsuarioService } from '../../services/usuario.service';

import { AlertController, PopoverController } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { SearchBarComponentParams } from 'src/app/shared/search-bar/search-bar.component';

import { MenuAccionesComponent } from '../../shared/menu-acciones/menu-acciones.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Role } from 'src/app/models/Role.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';

@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage implements OnInit {

  usuarios: Usuario[] = [];
  roles: Role[] = [];
  fotoclubs: Fotoclub[] = [];
  // usuariosFiltrados: Usuario[] = [];
  searchParams: SearchBarComponentParams;

  public searchQuery: string = '';
  private popover: HTMLIonPopoverElement = undefined;

  constructor(
    private usuarioSvc: UsuarioService,
    private fotoclubSvc: FotoclubService,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private auth: AuthService
  ) { }

  get titulo() {
    const u = this.auth.getUser()
    return this.auth.isAdmin() ? 'Miembros' : 
      `Concursantes del fotoclub ${u.fotoclub_id}`
  }
  getFotoclubName(id: number) {
    const a = this.fotoclubs
    return a.find(e => e.id == id).name
    // return this.usuarioSvc.getFotoclubName(id)
  }
  getRoleType(id: number) {
    const a = this.roles
    return a.find(e => e.id == id).type
    // return this.usuarioSvc.getRoleType(id)
  }

  // filtrarUsuarios({ atributo, query }: SearchBarComponentParams) {
  //   this.usuariosFiltrados = this.usuarios.filter(u => u[atributo].substr(0, query.length) == query)
  // }
  async filtrarUsuarios(output: SearchBarComponentParams) {
    if (output != undefined) {
      // console.log('buscando', output)
      let { atributo, query } = output;
      this.searchParams = output;
      this.usuarios = (await this.usuarioSvc.getUsuarios()).filter(u => u[atributo].substr(0, query.length) == query);
    }
  }
  // get usuariosFiltrados() {
  //   const q = this.searchQuery;
  //   return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  // }

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
            const r = await this.usuarioSvc.deleteUsuario(id);
            if (r) {
              this.refresh();
            }
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
    // this.popover = await this.popoverCtrl.create({
    //   component: MenuAccionesComponent, //componente a mostrar
    //   componentProps: {
    //     id,
    //     abmPage: this
    //   },
    //   cssClass: 'my-custom-class',
    //   event: ev,
    //   translucent: true,
    //   // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    // });
    await this.popover.present();

    
    this.popover.onDidDismiss().then(_ => this.popover = undefined)
    // const t = this;
    // this.router.events.subscribe() // dismiss popover cuando cambie de ruta
    const s = this.router.events
    .pipe() // .pipe(filter(event => event instanceof NavigationEnd))
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
    this.refresh();
    const t = this
    this.fotoclubSvc.getFotoclubs().then(r => t.fotoclubs = r)
    this.usuarioSvc.getRoles().then(r => t.roles = r)
  }

  async ionViewWillEnter() {
    this.refresh();
  }

  async refresh() {
    this.usuarios = await this.usuarioSvc.getUsuarios();
  }

  // para implementar busqueda con la api (sobrescribe variable de usuarios)
  // async buscarUsuarios(searchQuery) {
  //   console.log(searchQuery)
  // }
}