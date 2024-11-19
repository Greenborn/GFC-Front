import { Injectable } from '@angular/core';

export const CONFIG = {
  apiBaseUrl: "https://gfc.api.greenborn.com.ar/",//this.local ? "http://localhost:8888/" : "https://gfc.api.greenborn.com.ar/",
  loginAction:"login",
  appName: "app_gfc_-",
  version: "1.1.25"
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

}
