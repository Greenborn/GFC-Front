import { Component, OnInit } from '@angular/core';
import { ConsoleLogService } from './services/console-log.service';
import { Router } from '@angular/router';
import { ResponsiveService } from './services/ui/responsive.service';

declare global {
  interface Window { __gfcLoaded: boolean; }
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private static hasSetLoaded = false;
  public appPages = [
    { title: 'Inbox', url: '/folder/Inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
  sidebarOpen = false;

  constructor(
    public router: Router,
    public responsiveService: ResponsiveService,
    private consoleLogService: ConsoleLogService
  ) { }

  ngOnInit() {
    // Notificar que la app cargó (cancela watchdog de hidratación)
    document.dispatchEvent(new CustomEvent('gfc-ready'));

    // Ocultar barra de diagnóstico
    if (!AppComponent.hasSetLoaded) {
      AppComponent.hasSetLoaded = true;
      window.__gfcLoaded = true;
      const diag = document.getElementById('gfc-diag');
      if (diag) diag.style.display = 'none';
    }


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
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
