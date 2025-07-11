import axios from 'axios'
import configService from './config.js'

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
        console.log('AuthService: Token recibido, guardando en localStorage')
        configService.setLocalStorage('token', token)
        configService.setLocalStorage('userId', id)
        this.isAuthenticated = true
        this.user = { id }
        
        // Configurar el token para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        console.log('AuthService: Token configurado en axios headers')
        
        return { success: true, user: { id } }
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

  async logout() {
    try {
      await authAxios.post('logout')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      this.clearAuth()
    }
  }

  clearAuth() {
    configService.removeLocalStorage('token')
    configService.removeLocalStorage('userId')
    this.isAuthenticated = false
    this.user = null
    
    // Limpiar el header de autorización
    delete axios.defaults.headers.common['Authorization']
  }

  checkAuth() {
    const token = configService.getLocalStorage('token')
    const userId = configService.getLocalStorage('userId')
    
    if (token && userId) {
      this.isAuthenticated = true
      this.user = { id: parseInt(userId) }
      
      // Configurar el token para futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
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

  getUser() {
    if (!this.user) {
      const userId = configService.getLocalStorage('userId')
      if (userId) {
        this.user = { id: parseInt(userId) }
      }
    }
    return this.user
  }

  isLoggedIn() {
    const result = this.checkAuth()
    console.log('AuthService isLoggedIn:', result)
    return result
  }
}

export default new AuthService() 