import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ElementRef, OnChanges, SimpleChanges, HostListener, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { UsuarioImgComponent } from 'src/app/shared/usuario-img/usuario-img.component';
import { ThemeService } from 'src/app/services/ui/theme.service';
import { FOCUSABLE_SELECTORS } from 'src/app/shared/focus-utils';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { UserLogged } from 'src/app/models/user.model';
import { firstValueFrom } from 'rxjs';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, UsuarioImgComponent],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() open: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  installPrompt: BeforeInstallPromptEvent | null = null;
  appInstalled = false;

  private triggerElement: HTMLElement | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public auth: AuthService,
    public router: Router,
    public config: ConfigService,
    public rolificador: RolificadorService,
    public themeService: ThemeService,
    private el: ElementRef,
    private uiUtils: UiUtilsService,
    private profileService: ProfileService,
    private alertService: AlertService
  ) { }

  get darkMode(): boolean {
    return this.themeService.darkMode;
  }
  set darkMode(l: boolean) {
    this.themeService.darkMode = l;
  }
  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  get canInstall(): boolean {
    return !!this.installPrompt && !this.appInstalled;
  }

  async installApp() {
    if (!this.installPrompt) return;
    this.installPrompt.prompt();
    const result = await this.installPrompt.userChoice;
    this.installPrompt = null;
    if (result.outcome === 'accepted') {
      this.appInstalled = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      if (changes['open'].currentValue) {
        this.onOpen();
      } else if (!changes['open'].firstChange) {
        this.onClose();
      }
    }
  }

  private onOpen() {
    this.triggerElement = document.activeElement as HTMLElement;

    const host = this.el.nativeElement;
    const parent = host.parentElement;
    if (parent) {
      for (const child of parent.children) {
        if (child !== host) {
          child.setAttribute('aria-hidden', 'true');
        }
      }
    }

    setTimeout(() => {
      const elements = host.querySelectorAll(FOCUSABLE_SELECTORS);
      for (const el of elements) {
        if (el instanceof HTMLElement && el.offsetParent !== null) {
          el.focus();
          break;
        }
      }
    });
  }

  private onClose() {
    const host = this.el.nativeElement;
    const parent = host.parentElement;
    if (parent) {
      for (const child of parent.children) {
        if (child !== host) {
          child.removeAttribute('aria-hidden');
        }
      }
    }

    if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
      this.triggerElement.focus();
    }
    this.triggerElement = null;
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault();
      this.closeSidebar.emit();
      return;
    }
    if (event.key === 'Tab' && this.open) {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent) {
    const elements = this.el.nativeElement.querySelectorAll(FOCUSABLE_SELECTORS);
    const focusable = Array.from(elements).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.offsetParent !== null
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async openProfileImageModal(u: UserLogged) {
    const { ProfileImageModalComponent } = await import('src/app/shared/profile-image-modal/profile-image-modal.component');

    const isMobile = window.innerWidth <= 768;
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
      this.config.bustImageCache();

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

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.installPrompt = e as BeforeInstallPromptEvent;
    });

    window.addEventListener('appinstalled', () => {
      this.appInstalled = true;
      this.installPrompt = null;
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => {
        this.closeSidebar.emit();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
