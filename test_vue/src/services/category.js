import ApiService from './api.js'

class CategoryService extends ApiService {
  constructor() {
    super('category')
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

export default new CategoryService() 