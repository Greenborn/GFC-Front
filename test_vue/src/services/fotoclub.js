import ApiService from './api.js'

class FotoclubService extends ApiService {
  constructor() {
    super('fotoclub')
  }

  get template() {
    return {
      id: null,
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      status: 'active',
      created_at: null,
      updated_at: null
    }
  }
}

export default new FotoclubService() 