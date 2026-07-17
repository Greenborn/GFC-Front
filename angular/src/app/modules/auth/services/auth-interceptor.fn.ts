import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const LOG_URL = 'https://debug.greenborn.com.ar/api/console-log';
const SSO_TOKEN_KEY = 'sso_bearer_token';

function getLocalToken(): string | null {
  try { return localStorage.getItem('app_gfc_prod-token') || localStorage.getItem(SSO_TOKEN_KEY) || null; } catch { return null; }
}

function getUniqueId(): string | null {
  try { return localStorage.getItem('sso_client_unique_id'); } catch { return null; }
}

function setLocalToken(v: string | null): void {
  try {
    if (v == null) { localStorage.removeItem('app_gfc_prod-token'); }
    else { localStorage.setItem('app_gfc_prod-token', v); }
  } catch {}
}

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = getLocalToken();
  let request = req;

  const uniqueId = getUniqueId();
  if (uniqueId) {
    request = request.clone({
      params: request.params.set('unique_id', uniqueId)
    });
  }

  if (token && !request.url.startsWith(LOG_URL)) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${ token }` }
    });
  }
  if (!token && !request.url.startsWith(LOG_URL) && request.url.indexOf('auth/login') === -1) {
    console.log('Interceptor: request sin token', request.url);
  }

  return next(request).pipe(
    retry(2),
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const isLoginRequest = request.url.indexOf('auth/login') !== -1;
        if (!isLoginRequest) {
          const requireReauth = err.error?.require_reauth;
          if (requireReauth) {
            localStorage.removeItem('sso_bearer_token');
            localStorage.removeItem('sso_user_data');
          }
          setLocalToken(null);
          router.navigateByUrl('/login');
        }
      }
      else if (err.status === 0 && !token) {
        console.log('Error de red sin token - redirigiendo a login', err);
        setLocalToken(null);
        router.navigateByUrl('/login');
      }
      else if (err.status === 0) {
        console.log('Error de red temporal después de reintentos - manteniendo sesión', err);
      }
      else {
        console.log(`Error HTTP ${err.status} - ${err.statusText}`, err)
      }
      return throwError( () => err );
    })
  );
};
