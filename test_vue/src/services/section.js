import axios from 'axios'
import configService from './config.js'

class SectionService {
  get baseUrl() {
    return configService.publicApiUrl('section')
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

  async getAll(getParams = '') {
    const url = `${this.baseUrl}?${getParams}`
    const response = await axios.get(url)
    return response.data?.items ?? response.data
  }

  async get(id, getParams = '') {
    const url = `${this.baseUrl}/${id}?${getParams}`
    const response = await axios.get(url)
    return response.data
  }

  async post(model, id = undefined, getParams = '') {
    const headers = { 'Content-Type': 'application/json' }
    if (id == undefined) {
      const response = await axios.post(`${this.baseUrl}?${getParams}`, model, { headers })
      return response.data
    } else {
      const response = await axios.put(`${this.baseUrl}/${id}?${getParams}`, model, { headers })
      return response.data
    }
  }

  async delete(id) {
    const response = await axios.delete(`${this.baseUrl}/${id}`)
    return response.data
  }
}

export default new SectionService() 