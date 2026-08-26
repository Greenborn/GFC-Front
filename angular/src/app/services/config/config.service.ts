import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface EnvironmentConfig {
  production: boolean;
  version: string;
  loginAction: string;
  appName: string;
  imagesBaseUrl: string;
  nodeApiBaseUrl: string;
  ssoBaseUrl: string;
  ssoRedirect: string;
}

const env: EnvironmentConfig = environment as EnvironmentConfig;

export const CONFIG = {
  loginAction: env.loginAction,
  appName: env.appName,
  version: env.version,
  imagesBaseUrl: env.imagesBaseUrl,
  nodeApiBaseUrl: env.nodeApiBaseUrl,
  ssoBaseUrl: env.ssoBaseUrl,
  ssoRedirect: env.ssoRedirect
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private local = false;
  private imageCacheBuster: string = '';

  constructor() {
    const t = this.getLocalStorage('img_cache_buster');
    this.imageCacheBuster = t ? t : '';
  }

  bustImageCache(): void {
    this.imageCacheBuster = Date.now().toString();
    this.setLocalStorage('img_cache_buster', this.imageCacheBuster);
  }

  get data() {
    return CONFIG;
  }

  get loginUrl() { 
    return this.nodeApiBaseUrl + this.data.loginAction 
  }
  
  get tokenKey() { 
    return this.data.appName + 'token' 
  }

  setLocalStorage(r: string, v: any): void {
    try {
      if (v == null) {
        localStorage.removeItem(this.data.appName + r)
      } else {
        localStorage.setItem(this.data.appName + r, v .toString())
      }
    } catch (e) {
      console.warn('localStorage no disponible (set)', e);
    }
  }
  getLocalStorage(r: string): string {
    try {
      return localStorage.getItem(this.data.appName + r)
    } catch (e) {
      console.warn('localStorage no disponible (get)', e);
      return null;
    }
  }

  get imagesBaseUrl() {
    return this.data.imagesBaseUrl;
  }

  imageUrl(recurso: string) {
    if (!recurso) {
      return '';
    }
    recurso = recurso.toString();
    if (recurso.startsWith('http') || recurso.startsWith('data:')) {
      return recurso;
    }
    let base = this.data.imagesBaseUrl;
    if (!base.startsWith('http')) {
      base = 'https://' + base.replace(/^\/+/, '');
    }
    recurso = recurso.replace(/^\/+/, '');
    let url = base.replace(/\/$/, '') + '/' + recurso;
    if (this.imageCacheBuster) {
      url += (url.includes('?') ? '&' : '?') + 't=' + this.imageCacheBuster;
    }
    return url;
  }

  get nodeApiBaseUrl() {
    // fallback por si la variable no existe en environment
    return (environment as any).nodeApiBaseUrl;
  }

  getRecuperacionPasswordUrl(endpoint: string) {
    return this.nodeApiBaseUrl + 'auth/' + endpoint;
  }

  get ssoBaseUrl() {
    return this.data.ssoBaseUrl;
  }

  get ssoRedirect() {
    return this.data.ssoRedirect;
  }

}