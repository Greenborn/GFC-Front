import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface EnvironmentWithImagesBaseUrl {
  production: boolean;
  version: string;
  apiBaseUrl: string;
  publicApi: string;
  loginAction: string;
  appName: string;
  imagesBaseUrl: string;
}

const env: EnvironmentWithImagesBaseUrl = environment as EnvironmentWithImagesBaseUrl;

export const CONFIG = {
  apiBaseUrl: env.apiBaseUrl,
  publicApi: env.publicApi,
  loginAction: env.loginAction,
  appName: env.appName,
  version: env.version,
  imagesBaseUrl: env.imagesBaseUrl
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private local = false;

  constructor() { }

  get data() {
    return CONFIG;
  }

  get loginUrl() { 
    return this.data.apiBaseUrl + this.data.loginAction 
  }
  
  get tokenKey() { 
    return this.data.appName + 'token' 
  }

  apiUrl(recurso: string) { 
    return this.data.apiBaseUrl + recurso
  }

  publicApiUrl(recurso: string) { 
    return this.data.publicApi + recurso
  }

  setLocalStorage(r: string, v: any): void {
    if (v == null) {
      localStorage.removeItem(this.data.appName + r)
    } else {
      localStorage.setItem(this.data.appName + r, v .toString())
    }

  }
  getLocalStorage(r: string): string {
    return localStorage.getItem(this.data.appName + r)
  }

  get imagesBaseUrl() {
    return this.data.imagesBaseUrl;
  }

  imageUrl(recurso: string) {
    // Si la URL ya es absoluta, no la modifica
    if (recurso.startsWith('http') || recurso.startsWith('data:')) {
      return recurso;
    }
    // Normalizar base y recurso para evitar dobles barras o rutas relativas
    let base = this.data.imagesBaseUrl;
    if (!base.startsWith('http')) {
      base = 'https://' + base.replace(/^\/+/, '');
    }
    // Eliminar barra inicial del recurso si existe
    recurso = recurso.replace(/^\/+/, '');
    return base.replace(/\/$/, '') + '/' + recurso;
  }

}
