import axios from 'axios'
import configService from './config.js'

class AuthService {
  constructor() {
    this.isAuthenticated = false
    this.user = null
  }

  async login(credentials) {
    try {
      const response = await axios.post(configService.loginUrl, credentials)
      const { token, user } = response.data
      
      if (token) {
        configService.setLocalStorage('token', token)
        configService.setLocalStorage('user', JSON.stringify(user))
        this.isAuthenticated = true
        this.user = user
        return { success: true, user }
      }
      return { success: false, message: 'Credenciales inválidas' }
    } catch (error) {
      console.error('Error en login:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error en el servidor' 
      }
    }
  }

  async logout() {
    try {
      await axios.post('logout')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      this.clearAuth()
    }
  }

  clearAuth() {
    configService.removeLocalStorage('token')
    configService.removeLocalStorage('user')
    this.isAuthenticated = false
    this.user = null
  }

  checkAuth() {
    const token = configService.getLocalStorage('token')
    const userStr = configService.getLocalStorage('user')
    
    if (token && userStr) {
      this.isAuthenticated = true
      this.user = JSON.parse(userStr)
      return true
    }
    
    this.isAuthenticated = false
    this.user = null
    return false
  }

  getToken() {
    return configService.getLocalStorage('token')
  }

  getUser() {
    if (!this.user) {
      const userStr = configService.getLocalStorage('user')
      if (userStr) {
        this.user = JSON.parse(userStr)
      }
    }
    return this.user
  }

  isLoggedIn() {
    return this.checkAuth()
  }
}

export default new AuthService() 