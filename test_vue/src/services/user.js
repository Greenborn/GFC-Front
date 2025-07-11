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