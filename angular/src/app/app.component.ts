import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SSOAuthService, SSOSocketService, SSO_TOKEN_KEY } from 'angular-greenborn-sso-front';
import { ConsoleLogService } from './services/console-log.service';
import { ResponsiveService } from './services/ui/responsive.service';
import { NavbarComponent } from './nav/navbar/navbar.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';
import { AuthService } from './modules/auth/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent, SidebarComponent],
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  private socketSub: Subscription;

  constructor(
    public router: Router,
    public responsiveService: ResponsiveService,
    private consoleLogService: ConsoleLogService,
    private ssoAuth: SSOAuthService,
    private ssoSocket: SSOSocketService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
    document.documentElement.classList.add('gfc-force-visible');
    document.dispatchEvent(new CustomEvent('gfc-ready'));

    // Interceptar errores de consola después del bootstrap
    const originalConsoleError = console.error.bind(console);
    console.error = (...args: any[]) => {
      try {
        this.consoleLogService.sendLog(
          'error',
          args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '),
          {
            accion: 'console.error',
            usuario_id: localStorage.getItem('usuario_id') || undefined
          }
        );
      } catch (e) {
        // Si falla el envío, no romper el flujo
      }
      originalConsoleError(...args);
    };

    // Capturar errores JS fuera de Angular zone (event handlers, setTimeout, third-party)
    window.onerror = (message, source, lineno, colno, error) => {
      this.consoleLogService.sendLog('error', String(message), {
        accion: 'window.onerror',
        source, lineno, colno,
        stack: error?.stack || null,
        usuario_id: localStorage.getItem('usuario_id') || undefined
      });
    };

    // Capturar promesas rechazadas sin catch
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      this.consoleLogService.sendLog('error', reason?.message || String(reason), {
        accion: 'unhandledrejection',
        stack: reason?.stack || null,
        usuario_id: localStorage.getItem('usuario_id') || undefined
      });
    });

    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.asegurarTokenSocket();
    const haySesion = this.ssoAuth.isSSOSession() || !!this.auth.token;
    if (!haySesion) {
      console.log('[WebSocket] Sin sesión activa, no se intenta conectar.');
      return;
    }

    this.socketSub = this.ssoSocket.connected$.subscribe(connected => {
      if (connected) {
        console.log('[WebSocket] Conexión establecida.');
      }
    });

    this.ssoSocket.connect();
  }

  // El socket usa sso_bearer_token. Si la sesión es local (solo gfc_token), no hay
  // sso_bearer_token y el socket quedaría sin token. Copiamos el token local como respaldo
  // únicamente cuando sso_bearer_token está vacío (no afecta una sesión SSO activa).
  private asegurarTokenSocket(): void {
    try {
      if (localStorage.getItem(SSO_TOKEN_KEY)) return;
      const localToken = this.auth.token;
      if (localToken) {
        localStorage.setItem(SSO_TOKEN_KEY, localToken);
      }
    } catch (e) {
      console.warn('[WebSocket] No se pudo asegurar el token del socket', e);
    }
  }

  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
    this.ssoSocket.disconnect();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
