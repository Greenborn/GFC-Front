import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';

//componente que voy a mostrar
import { UsuarioPage } from '../../usuario/usuario.page';
import { NotificacionesPage } from '../../notificaciones/notificaciones.page';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  constructor(    
    private menu: MenuController,
    public popoverController: PopoverController,
    public router: Router,
    public auth: AuthService, //lo puse público!
    public rolificador: RolificadorService
    ) { }

  ngOnInit() {}

  // isLoggedIn(){ //agregado para no tener error al querer usar la funcion de auth desde la vista
  //   return this.auth.loggedIn;
  // }

  async openPopover( ev:any, ctrl: any, url: string ){
    //if (window.innerWidth > 767) {
      const popover = await this.popoverController.create({
        component: ctrl, //componente a mostrar
        cssClass: 'my-custom-class',
        event: ev,
        translucent: true,
        // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
      });
      await popover.present();
      // this.router.events.subscribe() // dismiss popover cuando cambie de ruta
      this.router.events
      .pipe() // .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          popover.dismiss();
        }
      });
      const { role } = await popover.onDidDismiss();
      // console.log('onDidDismiss resolved with role', role);
    /*}
    else {
      this.router.navigate([url]);
    }*/
  }
  async mostrarPerfil( ev:any ){
    this.openPopover(ev, UsuarioPage, '/perfil/editar');
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

}
