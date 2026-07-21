import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import axios from 'axios';
import { ConfigService } from './config/config.service';
import { AuthService } from '../modules/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  constructor(
    private config: ConfigService,
    private auth: AuthService
  ) { }

  checkConnectivity(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      axios.get(`${this.config.nodeApiBaseUrl}ping`, { timeout: 5000 })
        .then(() => {
          observer.next(true);
          observer.complete();
        })
        .catch(error => {
          console.log('Error de conectividad:', error);
          observer.next(false);
          observer.complete();
        });
    });
  }

  checkTokenValidity(): Observable<boolean> {
    if (!this.auth.token) {
      return of(false);
    }

    return new Observable<boolean>(observer => {
      const headers: Record<string, string> = {};
      if (this.auth.token) headers['Authorization'] = 'Bearer ' + this.auth.token;
      axios.get(`${this.config.nodeApiBaseUrl}user/${this.auth.userId}?expand=profile,profile.fotoclub,role`, { timeout: 10000, headers })
        .then(() => {
          observer.next(true);
          observer.complete();
        })
        .catch(error => {
          console.log('Token inválido:', error);
          if (error.response?.status === 401) {
            this.auth.logout();
          }
          observer.next(false);
          observer.complete();
        });
    });
  }

  checkSessionStatus(): Observable<{
    connected: boolean;
    authenticated: boolean;
    tokenValid: boolean;
  }> {
    return new Observable(observer => {
      this.checkConnectivity().subscribe(connected => {
        if (!connected) {
          observer.next({ connected: false, authenticated: false, tokenValid: false });
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
            setTimeout(tryConnect, 2000);
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
