import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { UsuarioPage } from '../../usuario/usuario.page';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { filter } from 'rxjs/operators';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  currentUrl: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    public router: Router,
    public auth: AuthService,
    public rolificador: RolificadorService,
    private UIUtilsService: UiUtilsService
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
    await this.UIUtilsService.mostrarModal(ctrl);
  }

  async mostrarPerfil(ev: any) {
    this.openPopover(ev, UsuarioPage, '/perfil/editar');
  }

  toggleMenu() {
    this.toggleSidebar.emit();
  }

}
