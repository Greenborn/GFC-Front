import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { ConfigService } from 'src/app/services/config/config.service';
import { AuthService } from './auth.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private authService:   AuthService,
    private config:        ConfigService,
    private router:        Router,
    private UIUtilsService: UiUtilsService
  ) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    const token: string = this.authService.token
    let request = req

    if (request.url != this.config.loginUrl && token) { 
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${ token }`
        }
      })
      // console.log('agregado token a request', request)
    } else {
      console.log(`request a ${request.url}`, request)
    }

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {

        if (err.status === 401 || err.statusText == 'Unknown Error') {
          console.log('catch error request sin autorizacion, redirect a login', err)
          this.router.navigateByUrl('/login');
        } else {
          console.log(`catch error request con status ${err.status}`, err)
        }
        this.UIUtilsService.dismissLoading();
        return throwError( err );

      })
    );
  }
}
