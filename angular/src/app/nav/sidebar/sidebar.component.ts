import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ElementRef, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { UsuarioImgComponent } from 'src/app/shared/usuario-img/usuario-img.component';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled]):not([hidden])',
  'input:not([disabled]):not([hidden])',
  'select:not([disabled]):not([hidden])',
  'textarea:not([disabled]):not([hidden])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]'
].join(', ');

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, UsuarioImgComponent],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnChanges {

  @Input() open: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  installPrompt: BeforeInstallPromptEvent | null = null;
  appInstalled = false;

  private triggerElement: HTMLElement | null = null;

  constructor(
    public auth: AuthService,
    public router: Router,
    public config: ConfigService,
    public rolificador: RolificadorService,
    private el: ElementRef
  ) { }

  get darkMode(): boolean {
    return document.body.classList.contains('dark');
  }
  set darkMode(l: boolean) {
    document.body.classList.toggle('dark', l);
    document.documentElement.setAttribute('data-bs-theme', l ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(l));
  }
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
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
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeSidebar.emit();
      });
  }
}
