import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
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
    public configService: ConfigService
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

  get version() {
    return environment.version;
  }

  get darkMode(): boolean {
    return document.body.classList.contains('dark');
  }

  set darkMode(l: boolean) {
    document.body.classList.toggle('dark', l);
    document.documentElement.setAttribute('data-bs-theme', l ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(l));
  }

  toggleMenu() {
    this.toggleSidebar.emit();
  }

}
