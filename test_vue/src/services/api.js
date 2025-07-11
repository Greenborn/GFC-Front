import axios from 'axios'
import configService from './config.js'

// Configurar axios
axios.defaults.baseURL = configService.data.apiBaseUrl
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Interceptor para agregar token a las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = configService.getLocalStorage('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - solo si no estamos en login
      if (!window.location.hash.includes('#/login')) {
        configService.removeLocalStorage('token')
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

class ApiService {
  constructor(recurso) {
    this.recurso = recurso
    this.fetchAllOnce = false
    this.all = null
    this.all_meta = null
  }

  get template() {
    return {}
  }

  async get(id, getParams = '') {
    console.log('get', this.recurso, id)
    const response = await axios.get(`${this.recurso}/${id}?${getParams}`)
    return response.data
  }

  getAllMeta() {
    return this.all_meta
  }

  async getAll(getParams = '', resource = null) {
    if (this.fetchAllOnce && this.all != null) {
      console.log('get all stored', this.all)
      return this.all
    } else {
      const url = `${resource ?? this.recurso}?${getParams}`
      console.log('getting', url)
      const response = await axios.get(url)
      const data = response.data
      console.log('get all', url, data)
      
      if (this.fetchAllOnce) {
        this.all = data.items
      }
      if (data != null) {
        this.all_meta = data._meta
        return data.items
      }
      return null
    }
  }

  async post(model, id = undefined, getParams = '') {
    console.log('posting', model, 'id: ', id)
    const headers = { 'Content-Type': 'application/json' }
    
    if (id == undefined) {
      const response = await axios.post(`${this.recurso}?${getParams}`, model, { headers })
      return response.data
    } else {
      const response = await axios.put(`${this.recurso}/${id}?${getParams}`, model, { headers })
      return response.data
    }
  }

  async postFormData(model, id = undefined, getParams = '') {
    console.log(model)
    const formData = new FormData()
    for (let key in model) {
      formData.append(key, model[key])
    }
    console.log('posting form data', formData, 'id: ', id)
    
    if (id == undefined) {
      const response = await axios.post(`${this.recurso}?${getParams}`, formData)
      return response.data
    } else {
      const response = await axios.put(`${this.recurso}/${id}?${getParams}`, formData)
      return response.data
    }
  }

  async delete(id) {
    const response = await axios.delete(`${this.recurso}/${id}`)
    return response.data
  }

  async put(model, id, recurso = null) {
    console.log('put', model, 'id: ', id)
    const headers = { 'Content-Type': 'application/json' }
    const response = await axios.put(`${recurso ?? this.recurso}/${id}`, model, { headers })
    return response.data
  }
}

export default ApiService 