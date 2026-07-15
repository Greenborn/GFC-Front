import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  @Input() open: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

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
  }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeSidebar.emit();
      });
  }
}
