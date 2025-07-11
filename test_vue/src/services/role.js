import ApiService from './api.js'

class RoleService extends ApiService {
  constructor() {
    super('role')
  }

  get template() {
    return {
      id: null,
      name: '',
      description: '',
      status: 'active',
      created_at: null,
      updated_at: null
    }
  }
}

export default new RoleService() 