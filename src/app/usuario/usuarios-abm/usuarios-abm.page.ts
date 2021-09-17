import { Component, OnInit } from '@angular/core';
import { Usuario } from '../usuario.model';
import { UsuarioService } from '../usuario.service';
import { MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';

//componente que voy a mostrar
import { UsuarioPage } from '../usuario.page';
import { NotificacionesPage } from '../../notificaciones/notificaciones.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios-abm',
  templateUrl: './usuarios-abm.page.html',
  styleUrls: ['./usuarios-abm.page.scss'],
})
export class UsuariosAbmPage implements OnInit {

  usuarios: Usuario[] = [];
  private searchQuery: string = '';

  constructor(
    private db: UsuarioService,
    private menu: MenuController,
    public popoverController: PopoverController,
    private router: Router
  ) { }

  async openPopover( ev:any, ctrl: any, url: string ){
    if (window.innerWidth > 767) {
      const popover = await this.popoverController.create({
        component: ctrl, //componente a mostrar
        cssClass: 'my-custom-class',
        event: ev,
        translucent: true,
        // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
      });
      await popover.present();
      // this.router.events.subscribe() // dismiss popover cuando cambie de ruta

      const { role } = await popover.onDidDismiss();
      // console.log('onDidDismiss resolved with role', role);
    }
    else {
      this.router.navigate([url]);
    }
  }
  async mostrarPerfil( ev:any ){
    this.openPopover(ev, UsuarioPage, '/perfil');
  }
  async mostrarNotificaciones( ev:any ) {
    this.openPopover(ev, NotificacionesPage, '/notificaciones');
  }

  openMenu(){
    this.menu.toggle();
  }
  // openFirst() {
  //   this.menu.enable(true, 'first');
  //   this.menu.open('first');
  // }

  // openEnd() {
  //   this.menu.open('end');
  // }

  // openCustom() {
  //   this.menu.enable(true, 'custom');
  //   this.menu.open('custom');
  // }

  get usuariosFiltrados() {
    // return [ ...this.usuarios ];
    const q = this.searchQuery;
    return this.usuarios.filter(u => u.username.substr(0, q.length) == q)
  }
  get usuarioProps() {
    return Object.keys(this.usuarios[0]);
  }

  async deleteUsuario(id: number) {
    const r = await this.db.deleteUsuario(id);
    if (r) {
      this.refresh();
    }
  }

  async editUsuario(id: number) {
    //TODO: 
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