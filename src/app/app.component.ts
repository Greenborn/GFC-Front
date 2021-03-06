import { Component, OnDestroy} from '@angular/core';
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
    public responsiveService: ResponsiveService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
         // Trick the Router into believing it's last link wasn't previously loaded
         this.router.navigated = false;
      }
    }); 

    var DEBUG = !window.location.href.includes('heroku');
    if(!DEBUG){
        // if(!window.console) window.console = undefined;
        var methods = ["log"];
        // var methods = ["log", "debug", "warn", "info"];
        for(var i=0;i<methods.length;i++){
            console[methods[i]] = function(){};
        }
    }
  }

  ngOnDestroy(){
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
}
