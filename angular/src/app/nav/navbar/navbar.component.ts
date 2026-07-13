import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';

import { UsuarioPage } from '../../usuario/usuario.page';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  currentUrl: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    public popoverController: PopoverController,
    public router: Router,
    public auth: AuthService,
    public rolificador: RolificadorService
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl = this.router.url;
      });
  }

  isActive(url: string): boolean {
    if (this.currentUrl === url) return true;
    if (url === '/concursos') {
      return this.currentUrl.startsWith('/concursos/') && !this.currentUrl.startsWith('/concursos/ranking');
    }
    return this.currentUrl.startsWith(url + '/') || this.currentUrl.startsWith(url + '?');
  }

  async openPopover(ev: any, ctrl: any, url: string) {
    const popover = await this.popoverController.create({
      component: ctrl,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
    });
    await popover.present();
    this.router.events
      .pipe()
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          popover.dismiss();
        }
      });
    await popover.onDidDismiss();
  }

  async mostrarPerfil(ev: any) {
    this.openPopover(ev, UsuarioPage, '/perfil/editar');
  }

  toggleMenu() {
    this.toggleSidebar.emit();
  }

}
