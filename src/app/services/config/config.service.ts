import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private local = true;

  constructor() { }

  get data() {
    return {
      apiBaseUrl: this.local ? "http://localhost:8888/" : "https://grupofotografico.api.greenborn.com.ar/",
      loginAction:"login",
      appName: "app_gfc_dev-"
    };
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

}
