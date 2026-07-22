import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';

import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ThemeService } from 'src/app/services/ui/theme.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UsuarioImgComponent } from 'src/app/shared/usuario-img/usuario-img.component';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { UserLogged } from 'src/app/models/user.model';
import { firstValueFrom } from 'rxjs';

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
    public configService: ConfigService,
    public themeService: ThemeService,
    private uiUtils: UiUtilsService,
    private profileService: ProfileService,
    public responsiveService: ResponsiveService,
    private alertService: AlertService
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
    return this.themeService.darkMode;
  }

  set darkMode(l: boolean) {
    this.themeService.darkMode = l;
  }

  async openProfileImageModal(u: UserLogged) {
    const { ProfileImageModalComponent } = await import('src/app/shared/profile-image-modal/profile-image-modal.component');

    const isMobile = !this.responsiveService.isDesktop;
    const result = await this.uiUtils.mostrarModal(
      ProfileImageModalComponent,
      {},
      isMobile
    );

    if (!result?.file) return;

    const profileId = u.profile?.id;
    if (!profileId) return;

    try {
      await firstValueFrom(
        this.profileService.postFormData({ image_file: result.file }, profileId)
      );

      this.auth.updateUser();
      this.configService.bustImageCache();

      this.alertService.show({
        header: 'Foto actualizada',
        message: 'Tu foto de perfil se actualizó correctamente.',
        buttons: [{ text: 'OK', role: 'confirm' }]
      });
    } catch (err) {
      console.error('Error al actualizar foto de perfil', err);
      this.alertService.show({
        header: 'Error',
        message: 'No se pudo actualizar la foto de perfil. Intentalo de nuevo.',
        buttons: [{ text: 'OK', role: 'confirm' }]
      });
    }
  }

  toggleMenu() {
    this.toggleSidebar.emit();
  }

}
