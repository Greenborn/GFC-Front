// Configuración de la aplicación
export const CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "https://gfc.prod-api.greenborn.com.ar/",
  publicApi: import.meta.env.VITE_PUBLIC_API_URL || "https://gfc.api2.greenborn.com.ar/",
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

  publicApiUrl(recurso) {
    return this.data.publicApi + recurso
  }

  setLocalStorage(r, v) {
    const key = this.data.appName + r
    if (v == null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, v.toString())
      // Disparar evento para sincronizar entre pestañas
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: v.toString(),
        oldValue: localStorage.getItem(key)
      }))
    }
  }

  getLocalStorage(r) {
    return localStorage.getItem(this.data.appName + r)
  }

  removeLocalStorage(r) {
    const key = this.data.appName + r
    const oldValue = localStorage.getItem(key)
    localStorage.removeItem(key)
    // Disparar evento para sincronizar entre pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: null,
      oldValue: oldValue
    }))
  }
}

export default new ConfigService() 