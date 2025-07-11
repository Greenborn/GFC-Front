import ApiService from './api.js'

class ProfileService extends ApiService {
  constructor() {
    super('profile')
  }

  get template() {
    return {
      id: null,
      name: '',
      last_name: '',
      dni: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      country: '',
      birth_date: '',
      gender: '',
      img_url: '',
      executive: false,
      executive_rol: '',
      fotoclub_id: null,
      user_id: null,
      created_at: null,
      updated_at: null
    }
  }

  // Obtener perfil con datos expandidos
  async getExpanded(id) {
    return await this.get(id, 'expand=user,fotoclub')
  }

  // Obtener perfiles con datos expandidos
  async getAllExpanded() {
    return await this.getAll('expand=user,fotoclub')
  }

  // Obtener perfiles por fotoclub
  async getByFotoclub(fotoclubId) {
    return await this.getAll(`filter[fotoclub_id]=${fotoclubId}&expand=user,fotoclub`)
  }

  // Subir imagen de perfil
  async uploadImage(profileId, formData) {
    return await this.postFormData(formData, profileId, 'upload_image=1')
  }
}

export default new ProfileService() 