import ApiService from './api.js'

class UserService extends ApiService {
  constructor() {
    super('user')
  }

  get template() {
    return {
      id: null,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role_id: null,
      fotoclub_id: null,
      status: 'active',
      created_at: null,
      updated_at: null
    }
  }

  // Obtener usuarios con datos expandidos (igual que Angular)
  async getAllExpanded() {
    return await this.getAll('expand=profile,profile.fotoclub,role')
  }

  // Obtener usuarios por rol (para filtros)
  async getByRole(roleId) {
    return await this.getAll(`filter[role_id]=${roleId}&expand=profile,profile.fotoclub,role`)
  }

  // Obtener usuarios por fotoclub (para filtros)
  async getByFotoclub(fotoclubId) {
    return await this.getAll(`filter[profile.fotoclub_id]=${fotoclubId}&expand=profile,profile.fotoclub,role`)
  }

  async createUser(userData) {
    return await this.post(userData)
  }

  async updateUser(id, userData) {
    return await this.post(userData, id)
  }

  async changePassword(passwordData) {
    return await this.post(passwordData, null, 'change_password=1')
  }

  async resetPassword(email) {
    return await this.post({ email }, null, 'reset_password=1')
  }

  async verifyCode(code) {
    return await this.post({ code }, null, 'verify_code=1')
  }

  async getProfile(userId) {
    return await this.get(userId, 'profile=1')
  }

  async updateProfile(userId, profileData) {
    return await this.post(profileData, userId, 'profile=1')
  }
}

export default new UserService() 