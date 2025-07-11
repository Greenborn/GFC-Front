import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout, retry, map } from 'rxjs/operators';
import { ConfigService } from './config/config.service';
import { AuthService } from '../modules/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private auth: AuthService
  ) { }

  /**
   * Verifica si hay conectividad con la API
   */
  checkConnectivity(): Observable<boolean> {
    return this.http.get(`${this.config.data.apiBaseUrl}ping`, { 
      responseType: 'text' 
    }).pipe(
      timeout(5000), // 5 segundos de timeout
      retry(1),
      map(() => true), // Si llega aquí, hay conectividad
      catchError(error => {
        console.log('Error de conectividad:', error);
        return of(false);
      })
    );
  }

  /**
   * Verifica si el token actual es válido
   */
  checkTokenValidity(): Observable<boolean> {
    if (!this.auth.token) {
      return of(false);
    }

    return this.http.get(`${this.config.apiUrl('user')}/${this.auth.userId}?expand=profile,profile.fotoclub,role`).pipe(
      timeout(10000), // 10 segundos de timeout
      retry(1),
      map(() => true), // Si llega aquí, el token es válido
      catchError(error => {
        console.log('Token inválido:', error);
        if (error.status === 401) {
          this.auth.logout();
        }
        return of(false);
      })
    );
  }

  /**
   * Verifica el estado completo de la sesión
   */
  checkSessionStatus(): Observable<{
    connected: boolean;
    authenticated: boolean;
    tokenValid: boolean;
  }> {
    return new Observable(observer => {
      this.checkConnectivity().subscribe(connected => {
        if (!connected) {
          observer.next({
            connected: false,
            authenticated: false,
            tokenValid: false
          });
          observer.complete();
          return;
        }

        this.checkTokenValidity().subscribe(tokenValid => {
          observer.next({
            connected: true,
            authenticated: this.auth.loggedIn,
            tokenValid: tokenValid
          });
          observer.complete();
        });
      });
    });
  }

  /**
   * Intenta reconectar automáticamente
   */
  attemptReconnection(): Observable<boolean> {
    return new Observable(observer => {
      let attempts = 0;
      const maxAttempts = 3;

      const tryConnect = () => {
        attempts++;
        console.log(`Intento de reconexión ${attempts}/${maxAttempts}`);

        this.checkConnectivity().subscribe(connected => {
          if (connected) {
            console.log('Reconexión exitosa');
            observer.next(true);
            observer.complete();
          } else if (attempts < maxAttempts) {
            setTimeout(tryConnect, 2000); // Esperar 2 segundos antes del siguiente intento
          } else {
            console.log('Falló la reconexión después de', maxAttempts, 'intentos');
            observer.next(false);
            observer.complete();
          }
        });
      };

      tryConnect();
    });
  }
} 