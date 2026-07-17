import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UsuarioImgComponent } from 'src/app/shared/usuario-img/usuario-img.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, UsuarioImgComponent],
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {

  currentUrl: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    public auth: AuthService,
    public rolificador: RolificadorService,
    public configService: ConfigService
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentUrl = this.router.url;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
