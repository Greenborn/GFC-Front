import ApiService from './api.js'

class SectionService extends ApiService {
  constructor() {
    super('section')
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

export default new SectionService() 