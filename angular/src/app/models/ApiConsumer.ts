import { Component, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { AlertService } from 'src/app/services/ui/alert.service';

@Component({
  template: ''
})
export abstract class ApiConsumer implements OnDestroy {

  // // https://dev.to/re4388/use-rxjs-takeuntil-to-unsubscribe-1ffj
  private readonly unsubscribe$: Subject<void> = new Subject();

  constructor(
    protected alertService: AlertService
  ) { }

  protected fetch<T>(callback: CallableFunction): Observable<T> {
    // console.log(`fetching api desde ${this.name}` ,)
    return callback().pipe(
      takeUntil(this.unsubscribe$)
    )
  }

async displayAlert(message: string, header:string = 'Error') {
  this.alertService.showError({ message, header });
  }

  ngOnDestroy() {
  // ionViewWillLeave() {
    // console.log(`unsuscribed fetch`)
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  //Esta función será usada para filtrar todos los errores, quitando campos escupidos por la base de datos
  errorFilter( e:string ){
    e = e.replace('ERROR:','');
    let i:number   = e.indexOf('CONTEXT') -1;

    if (i == -2) return e
    
    let aux:string = '';
    for (let c=0; c < i; c++){
      aux += e[c];
    }
    aux += '.';
    return aux;
  }

}
