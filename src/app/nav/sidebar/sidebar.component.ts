import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  @ViewChild('menu') menu: HTMLIonMenuElement

  constructor(
    public auth: AuthService,
    private router: Router,
    public rolificador: RolificadorService
  ) { }

  ngOnInit() {
    const s = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(async (e) => this.menu.close());
    // {
      // if (e instanceof NavigationEnd) {
        // if (this.popover != undefined) {
        //   await this.popoverCtrl.dismiss(this.popover);
        //   this.popover = undefined
        // }
        // s.unsubscribe();
      // }
    // });
  }

  // isLoggedIn(){ //agregado para no tener error al querer usar la funcion de auth desde la vista
  //   return this.auth.loggedIn;
  // }
}
