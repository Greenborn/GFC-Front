import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  @Input() open: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  installPrompt: BeforeInstallPromptEvent | null = null;
  appInstalled = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    public config: ConfigService,
    public rolificador: RolificadorService
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
