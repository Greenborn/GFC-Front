<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4>{{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveUsuario">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="username" class="form-label">Usuario *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="usuario.username"
                    required
                    :disabled="isEditing"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email *</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="usuario.email"
                    required
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="first_name" class="form-label">Nombre *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="first_name" 
                    v-model="usuario.first_name"
                    required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="last_name" class="form-label">Apellido *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="last_name" 
                    v-model="usuario.last_name"
                    required
                  >
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="password" class="form-label">
                    {{ isEditing ? 'Nueva Contraseña' : 'Contraseña *' }}
                  </label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="usuario.password"
                    :required="!isEditing"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="role_id" class="form-label">Rol</label>
                  <select class="form-select" id="role_id" v-model="usuario.role_id">
                    <option value="">Seleccionar rol</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="fotoclub_id" class="form-label">Organización</label>
                  <select class="form-select" id="fotoclub_id" v-model="usuario.fotoclub_id">
                    <option value="">Sin organización</option>
                    <option v-for="fotoclub in fotoclubs" :key="fotoclub.id" :value="fotoclub.id">
                      {{ fotoclub.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="status" class="form-label">Estado</label>
                  <select class="form-select" id="status" v-model="usuario.status">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div class="d-flex justify-content-between">
                <router-link to="/usuarios" class="btn btn-secondary">
                  <i class="bi bi-arrow-left me-1"></i>Cancelar
                </router-link>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>

            <div v-if="errorMessage" class="alert alert-danger mt-3">
              {{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userService from '../../services/user.js'
import roleService from '../../services/role.js'
import fotoclubService from '../../services/fotoclub.js'

export default {
  name: 'UsuarioPost',
  data() {
    return {
      usuario: {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role_id: '',
        fotoclub_id: '',
        status: 'active'
      },
      roles: [],
      fotoclubs: [],
      loading: false,
      errorMessage: ''
    }
  },
  computed: {
    isEditing() {
      return !!this.$route.params.id
    }
  },
  async mounted() {
    await this.loadData()
    if (this.isEditing) {
      await this.loadUsuario()
    }
  },
  methods: {
    async loadData() {
      try {
        const [roles, fotoclubs] = await Promise.all([
          roleService.getAll(),
          fotoclubService.getAll()
        ])
        this.roles = roles || []
        this.fotoclubs = fotoclubs || []
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    },

    async loadUsuario() {
      try {
        const id = this.$route.params.id
        const usuario = await userService.get(id)
        this.usuario = { ...usuario }
        this.usuario.password = '' // No mostrar contraseña
      } catch (error) {
        console.error('Error cargando usuario:', error)
        this.errorMessage = 'Error al cargar el usuario'
      }
    },

    async saveUsuario() {
      try {
        this.loading = true
        this.errorMessage = ''

        const userData = { ...this.usuario }
        if (!userData.password) {
          delete userData.password
        }

        if (this.isEditing) {
          await userService.updateUser(this.$route.params.id, userData)
        } else {
          await userService.createUser(userData)
        }

        this.$router.push('/usuarios')
      } catch (error) {
        console.error('Error guardando usuario:', error)
        this.errorMessage = 'Error al guardar el usuario'
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 