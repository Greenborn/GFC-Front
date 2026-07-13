import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConsoleLogService {
  private readonly API_URL = 'https://debug.greenborn.com.ar/api/console-log';
  private readonly API_KEY = 'o2fSFJNal96tcARiN5ueYzeBmpboC7CJqtddGvYfpZqUDujzqWu272VMquA9Z2A5NdS9vXOXX2w31J5V8uDBTXLG0CLfcWLRsW48K';

  constructor(private http: HttpClient) {}

  sendLog(nivel: string, mensaje: string, datos: any = {}) {
    let usuario_id = '';
    try {
      usuario_id = (localStorage.getItem('app_gfc_prod-userId') || '') + '_' + (localStorage.getItem('app_gfc_dev-userId') || '');
    } catch (e) {
      // localStorage no disponible (modo incógnito), ignorar
    }
    const body = {
      nivel,
      mensaje,
      datos: {
        ...datos,
        timestamp: new Date().toISOString(),
        modulo: 'angular-app',
        usuario_id: usuario_id
      }
    };
    // Fire-and-forget con timeout para no bloquear en redes lentas
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json'
    });
    this.http.post(this.API_URL, body, { headers }).pipe(
      timeout(3000),
      catchError(() => of(null))
    ).subscribe();
  }
}
