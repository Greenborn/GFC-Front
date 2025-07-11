import axios from 'axios'
import configService from './config.js'
import userService from './user.js'

// Crear una instancia de axios específica para autenticación sin interceptores
const authAxios = axios.create({
  baseURL: configService.data.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

class AuthService {
  constructor() {
    this.isAuthenticated = false
    this.user = null
    
    // Inicializar el token si existe al crear la instancia
    this.checkAuth()
  }

  async login(credentials) {
    try {
      console.log('AuthService: Iniciando login a:', configService.loginUrl)
      console.log('AuthService: Credenciales:', credentials)
      
      const response = await authAxios.post(configService.data.loginAction, credentials)
      console.log('AuthService: Respuesta del servidor:', response.data)
      
      const { token, id } = response.data
      
      if (token) {
        console.log('AuthService: Login exitoso, guardando token e id')
        // Guardar token e id en localStorage (igual que Angular)
        configService.setLocalStorage('token', token)
        configService.setLocalStorage('userId', id)
        
        // Configurar token para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Obtener datos completos del usuario
        await this.loadUserData(parseInt(id))
        
        return { success: true, user: this.user }
      }
      console.log('AuthService: No se recibió token')
      return { success: false, message: 'Credenciales inválidas' }
    } catch (error) {
      console.error('AuthService: Error en login:', error)
      console.error('AuthService: Error response:', error.response?.data)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error en el servidor' 
      }
    }
  }

  async loadUserData(userId) {
    try {
      // Obtener datos completos del usuario con expand
      const userData = await userService.get(userId, 'expand=profile,profile.fotoclub,role')
      this.user = userData
      this.isAuthenticated = true
      console.log('AuthService: Datos de usuario cargados:', userData)
    } catch (error) {
      console.error('AuthService: Error cargando datos de usuario:', error)
      // Si falla, al menos mantener el id básico
      this.user = { id: userId }
      this.isAuthenticated = true
    }
  }

  async logout() {
    // Igual que Angular: limpiar token e id
    configService.setLocalStorage('token', null)
    configService.setLocalStorage('userId', null)
    
    // Limpiar estado interno
    this.isAuthenticated = false
    this.user = null
    
    // Limpiar headers de axios
    delete axios.defaults.headers.common['Authorization']
    
    // Redirigir a login (igual que Angular)
    window.location.hash = '#/login'
  }

  clearAuth() {
    configService.setLocalStorage('token', null)
    configService.setLocalStorage('userId', null)
    this.isAuthenticated = false
    this.user = null
    
    // Limpiar el header de autorización
    delete axios.defaults.headers.common['Authorization']
  }

  async checkAuth() {
    // Igual que Angular: verificar token en localStorage
    const token = configService.getLocalStorage('token')
    const userId = configService.getLocalStorage('userId')
    
    if (token && userId) {
      // Configurar el token para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Obtener datos completos del usuario
      await this.loadUserData(parseInt(userId))
      
      return true
    }
    
    this.isAuthenticated = false
    this.user = null
    
    // Limpiar el header de autorización
    delete axios.defaults.headers.common['Authorization']
    
    return false
  }

  getToken() {
    return configService.getLocalStorage('token')
  }

  // Propiedad loggedIn (igual que Angular)
  get loggedIn() {
    return this.token != null
  }

  // Getter para token (igual que Angular)
  get token() {
    return configService.getLocalStorage('token')
  }

  async getUser() {
    if (!this.user) {
      const userId = configService.getLocalStorage('userId')
      if (userId) {
        await this.loadUserData(parseInt(userId))
      }
    }
    return this.user
  }

  isLoggedIn() {
    // Igual que Angular: verificar si existe el token en localStorage
    const token = configService.getLocalStorage('token')
    const hasToken = token != null
    console.log('AuthService isLoggedIn:', hasToken)
    return hasToken
  }
}

export default new AuthService() 