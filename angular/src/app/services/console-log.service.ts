import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({ providedIn: 'root' })
export class ConsoleLogService {
  private readonly API_URL = 'https://debug.greenborn.com.ar/api/console-log';
  private readonly API_KEY = 'o2fSFJNal96tcARiN5ueYzeBmpboC7CJqtddGvYfpZqUDujzqWu272VMquA9Z2A5NdS9vXOXX2w31J5V8uDBTXLG0CLfcWLRsW48K';

  sendLog(nivel: string, mensaje: string, datos: any = {}) {
    let usuario_id = '';
    try {
      usuario_id = (localStorage.getItem('app_gfc_prod-userId') || '') + '_' + (localStorage.getItem('app_gfc_dev-userId') || '');
    } catch (e) {}
    const body = {
      nivel,
      mensaje,
      datos: {
        ...datos,
        timestamp: new Date().toISOString(),
        modulo: 'angular-app',
        usuario_id
      }
    };
    axios.post(this.API_URL, body, {
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 3000
    }).catch(() => {});
  }
}
