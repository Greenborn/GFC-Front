import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, delay } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

import { ConfigService } from 'src/app/services/config/config.service';
import { AuthService } from './auth.service';
import { SSOAuthService } from './sso-auth.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(
    private authService:   AuthService,
    private config:        ConfigService,
    private router:        Router,
    private ssoAuth:       SSOAuthService,
    private UIUtilsService: UiUtilsService
  ) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    const token: string = this.authService.token
    let request = req

    const LOG_URL = 'https://debug.greenborn.com.ar/api/console-log';

    let uniqueId: string | null = null;
    try { uniqueId = this.ssoAuth.getUniqueId(); } catch {}
    if (uniqueId) {
      request = request.clone({
        params: request.params.set('unique_id', uniqueId)
      });
    }

    if (request.url !== this.config.loginUrl && token && !request.url.startsWith(LOG_URL)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${ token }`
        }
      });
    }

    return next.handle(request).pipe(
      // Reintentar hasta 2 veces para errores de red
      retry(2),
      catchError((err: HttpErrorResponse) => {

        // Solo cerrar sesión en casos específicos de autenticación
        if (err.status === 401) {
          const isLoginRequest = (request.url === this.config.loginUrl) || (request.url.startsWith(this.config.nodeApiBaseUrl) && request.url.indexOf('auth/login') !== -1)
          if (!isLoginRequest) {
            const requireReauth = err.error?.require_reauth;
            if (requireReauth) {
              localStorage.removeItem('sso_bearer_token');
              localStorage.removeItem('sso_user_data');
            }
            this.authService.logout();
          }
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
