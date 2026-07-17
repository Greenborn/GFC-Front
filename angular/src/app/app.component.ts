import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ConsoleLogService } from './services/console-log.service';
import { ResponsiveService } from './services/ui/responsive.service';
import { NavbarComponent } from './nav/navbar/navbar.component';
import { SidebarComponent } from './nav/sidebar/sidebar.component';

@Component({
  standalone: true,
  imports: [RouterModule, NavbarComponent, SidebarComponent],
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
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
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
