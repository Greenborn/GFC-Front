import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, delay } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

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
      // Reintentar hasta 2 veces para errores de red
      retry(2),
      catchError((err: HttpErrorResponse) => {

        // Solo cerrar sesión en casos específicos de autenticación
        if (err.status === 401) {
          console.log('Error 401 - Token expirado o inválido, cerrando sesión', err);
          this.authService.logout();
        } 
        // Para errores de red (status 0), solo cerrar sesión si no hay token
        else if (err.status === 0 && !token) {
          console.log('Error de red sin token - redirigiendo a login', err);
          this.authService.logout();
        }
        // Para otros errores de red, solo loggear sin cerrar sesión
        else if (err.status === 0) {
          console.log('Error de red temporal después de reintentos - manteniendo sesión', err);
        }
        // Para otros errores HTTP, solo loggear
        else {
          console.log(`Error HTTP ${err.status} - ${err.statusText}`, err)
        }
        
        this.UIUtilsService.dismissLoading();
        return throwError( err );

      })
    );
  }
}
