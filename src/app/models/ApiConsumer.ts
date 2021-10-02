import { OnDestroy } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

export abstract class ApiConsumer implements OnDestroy {

  // // https://dev.to/re4388/use-rxjs-takeuntil-to-unsubscribe-1ffj
  private readonly unsubscribe$: Subject<void> = new Subject();

  constructor(
    private name: string,
    protected alertCtrl: AlertController
  ) { }

  protected fetch<T>(callback: CallableFunction): Observable<T> {
    // console.log(`fetching api desde ${this.name}` ,)
    return callback().pipe(
      takeUntil(this.unsubscribe$)
    )
  }

async displayAlert(message: string) {
  // this.alertCtrl.dismiss();
  (await this.alertCtrl.create({
    header: 'Error',
    message,
    buttons: [{
      text: 'Ok',
      role: 'cancel'
    }]
  })).present()
  }

  ngOnDestroy() {
    console.log(`unsuscribed ${this.name}`)
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

