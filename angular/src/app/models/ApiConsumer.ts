import { Component, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AlertService } from 'src/app/services/ui/alert.service';
import { errorFilter as _errorFilter } from 'src/app/shared/error-utils';

@Component({
  standalone: false,
  template: ''
})
export abstract class ApiConsumer implements OnDestroy {

  protected readonly unsubscribe$: Subject<void> = new Subject();

  constructor(
    protected alertService: AlertService
  ) { }

  protected fetch<T>(callback: CallableFunction): Observable<T> {
    return callback().pipe(
      takeUntil(this.unsubscribe$)
    )
  }

async displayAlert(message: string, header:string = 'Error') {
  this.alertService.showError({ message, header });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  errorFilter(e: string): string {
    return _errorFilter(e);
  }

}
