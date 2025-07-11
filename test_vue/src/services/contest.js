import ApiService from './api.js'

class ContestService extends ApiService {
  constructor() {
    super('contest')
  }

  get template() {
    return {
      id: null,
      title: '',
      sub_title: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'active',
      created_at: null,
      updated_at: null
    }
  }

  async getContestResults(contestId) {
    return await this.getAll(`contest_id=${contestId}`, 'contest-result')
  }

  async getContestCategories(contestId) {
    return await this.getAll(`contest_id=${contestId}`, 'contest-category')
  }

  async getContestSections(contestId) {
    return await this.getAll(`contest_id=${contestId}`, 'contest-section')
  }

  async getContestRecords(contestId) {
    return await this.getAll(`contest_id=${contestId}`, 'contest-records')
  }

  async uploadResults(contestId, formData) {
    return await this.postFormData(formData, contestId, 'upload_results=1')
  }

  async getCompressedPhotos(contestId) {
    return await this.getAll(`contest_id=${contestId}`, 'compressed-photos')
  }

  async getAllConcursos() {
    // Traer todos los concursos sin paginación (Yii2 REST)
    return await this.getAll('per-page=1000')
  }
}

export default new ContestService() 