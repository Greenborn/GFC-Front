import ApiService from './api.js'

class RankingService extends ApiService {
  constructor() {
    super('ranking')
  }

  get template() {
    return {
      profiles: [],
      fotoclubs: []
    }
  }

  // Obtener todos los datos de ranking
  async getAll() {
    return await super.getAll()
  }
}

export default new RankingService() 