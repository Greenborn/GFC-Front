<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4>Editar Mi Perfil</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="first_name" class="form-label">Nombre *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="first_name" 
                    v-model="profile.first_name"
                    required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="last_name" class="form-label">Apellido *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="last_name" 
                    v-model="profile.last_name"
                    required
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email *</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="profile.email"
                  required
                >
              </div>

              <div class="mb-3">
                <label for="current_password" class="form-label">Contraseña Actual</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="current_password" 
                  v-model="profile.current_password"
                >
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="new_password" class="form-label">Nueva Contraseña</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="new_password" 
                    v-model="profile.new_password"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="confirm_password" class="form-label">Confirmar Nueva Contraseña</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirm_password" 
                    v-model="profile.confirm_password"
                  >
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="/concursos" class="btn btn-secondary">
                  <i class="bi bi-arrow-left me-1"></i>Cancelar
                </router-link>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>

            <div v-if="errorMessage" class="alert alert-danger mt-3">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success mt-3">
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userService from '../../services/user.js'
import authService from '../../services/auth.js'

export default {
  name: 'UsuarioEdit',
  data() {
    return {
      profile: {
        first_name: '',
        last_name: '',
        email: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  async mounted() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        const user = authService.getUser()
        if (user) {
          this.profile.first_name = user.first_name || ''
          this.profile.last_name = user.last_name || ''
          this.profile.email = user.email || ''
        }
      } catch (error) {
        console.error('Error cargando perfil:', error)
        this.errorMessage = 'Error al cargar el perfil'
      }
    },

    async saveProfile() {
      try {
        this.loading = true
        this.errorMessage = ''
        this.successMessage = ''

        // Validar contraseñas si se están cambiando
        if (this.profile.new_password) {
          if (!this.profile.current_password) {
            this.errorMessage = 'Debe ingresar la contraseña actual'
            return
          }
          if (this.profile.new_password !== this.profile.confirm_password) {
            this.errorMessage = 'Las contraseñas nuevas no coinciden'
            return
          }
        }

        const user = authService.getUser()
        const profileData = {
          first_name: this.profile.first_name,
          last_name: this.profile.last_name,
          email: this.profile.email
        }

        if (this.profile.new_password) {
          profileData.current_password = this.profile.current_password
          profileData.new_password = this.profile.new_password
        }

        await userService.updateProfile(user.id, profileData)
        
        this.successMessage = 'Perfil actualizado correctamente'
        
        // Limpiar campos de contraseña
        this.profile.current_password = ''
        this.profile.new_password = ''
        this.profile.confirm_password = ''
        
      } catch (error) {
        console.error('Error guardando perfil:', error)
        this.errorMessage = 'Error al guardar el perfil'
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 