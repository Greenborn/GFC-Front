// Configuración de la aplicación
export const CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "https://gfc.prod-api.greenborn.com.ar/",
  loginAction: import.meta.env.VITE_LOGIN_ACTION || "login",
  appName: import.meta.env.VITE_APP_NAME || "app_gfc_prod-",
  version: import.meta.env.VITE_VERSION || "1.1.32"
}

class ConfigService {
  constructor() {
    this.local = false
  }

  get data() {
    return CONFIG
  }

  get loginUrl() {
    return this.data.apiBaseUrl + this.data.loginAction
  }

  get tokenKey() {
    return this.data.appName + 'token'
  }

  apiUrl(recurso) {
    return this.data.apiBaseUrl + recurso
  }

  setLocalStorage(r, v) {
    if (v == null) {
      localStorage.removeItem(this.data.appName + r)
    } else {
      localStorage.setItem(this.data.appName + r, v.toString())
    }
  }

  getLocalStorage(r) {
    return localStorage.getItem(this.data.appName + r)
  }

  removeLocalStorage(r) {
    localStorage.removeItem(this.data.appName + r)
  }
}

export default new ConfigService() 