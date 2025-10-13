import { Component, OnDestroy } from '@angular/core';
import { ConsoleLogService } from './services/console-log.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResponsiveService } from './services/ui/responsive.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy {
  public appPages = [
    { title: 'Inbox', url: '/folder/Inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  
  private routerSub: Subscription;

  // https://stackoverflow.com/questions/59552387/how-to-reload-a-page-in-angular-8-the-proper-way
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public responsiveService: ResponsiveService,
    private consoleLogService: ConsoleLogService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
         // Trick the Router into believing it's last link wasn't previously loaded
         this.router.navigated = false;
      }
    }); 

    // Interceptar todos los errores de consola
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Enviar al servicio de logs
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
      // Mostrar en consola como siempre
      originalConsoleError.apply(console, args);
    };
  }

  ngOnDestroy(){
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
