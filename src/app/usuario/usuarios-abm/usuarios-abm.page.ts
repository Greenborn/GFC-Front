import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from '../usuario.model';
import { UsuarioService } from '../usuario.service';

import { AlertController, PopoverController } from '@ionic/angular';
import { MenuAccionesComponent } from './menu-acciones/menu-acciones.component';
import { NavigationEnd, Router } from '@angular/router';
import { SearchBarComponentParams } from 'src/app/shared/search-bar/search-bar.component';


@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage implements OnInit {

  usuarios: Usuario[] = [];
  // usuariosFiltrados: Usuario[] = [];
  searchParams: SearchBarComponentParams;

  public searchQuery: string = '';
  private popover: HTMLIonPopoverElement = undefined;

  constructor(
    private db: UsuarioService,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private router: Router
  ) { }

  // filtrarUsuarios({ atributo, query }: SearchBarComponentParams) {
  //   this.usuariosFiltrados = this.usuarios.filter(u => u[atributo].substr(0, query.length) == query)
  // }
  async filtrarUsuarios(output: SearchBarComponentParams) {
    if (output != undefined) {
      // console.log('buscando', output)
      let { atributo, query } = output;
      this.searchParams = output;
      this.usuarios = (await this.db.getUsuarios()).filter(u => u[atributo].substr(0, query.length) == query);
    }
  }
  // get usuariosFiltrados() {
  //   const q = this.searchQuery;
  //   return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  // }
  get usuarioProps() {
    return Object.keys(this.usuarios[0]);
  }

  async dismissPopover() {
    await this.popover.dismiss();
    this.popover = undefined;
  }

  async deleteUsuario(id: number) {

    if (this.popover != undefined) {
      this.dismissPopover();
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
            const r = await this.db.deleteUsuario(id);
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
        id,
        abmPage: this
      },
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
      // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    });
    await this.popover.present();
    // const t = this;
    // this.router.events.subscribe() // dismiss popover cuando cambie de ruta
    const s = this.router.events
    .pipe() // .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(async (e) => {
      if (e instanceof NavigationEnd) {
        await this.dismissPopover();
        s.unsubscribe();
      }
    });
  }

  async ngOnInit() {
    this.refresh();
  }

  async ionViewWillEnter() {
    this.refresh();
  }

  async refresh() {
    this.usuarios = await this.db.getUsuarios();
  }

  // para implementar busqueda con la api (sobrescribe variable de usuarios)
  // async buscarUsuarios(searchQuery) {
  //   console.log(searchQuery)
  // }
}