<template>
  <div class="container">
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <div v-else-if="usuario" class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body text-center">
            <img 
              :src="usuario.avatar || '/default-avatar.png'" 
              alt="Avatar" 
              class="rounded-circle mb-3" 
              width="150" 
              height="150"
            >
            <h4>{{ usuario.first_name }} {{ usuario.last_name }}</h4>
            <p class="text-muted">@{{ usuario.username }}</p>
            <span class="badge" :class="getStatusBadgeClass(usuario.status)">
              {{ getStatusText(usuario.status) }}
            </span>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>Información del Usuario</h5>
            <router-link :to="`/usuarios/editar/${usuario.id}`" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-pencil me-1"></i>Editar
            </router-link>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <p><strong>Email:</strong> {{ usuario.email }}</p>
                <p><strong>Rol:</strong> {{ usuario.role_name || 'Sin rol' }}</p>
                <p><strong>Organización:</strong> {{ usuario.fotoclub_name || 'Sin organización' }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Fecha de registro:</strong> {{ formatDate(usuario.created_at) }}</p>
                <p><strong>Última actualización:</strong> {{ formatDate(usuario.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userService from '../../services/user.js'

export default {
  name: 'Perfil',
  data() {
    return {
      usuario: null,
      loading: true,
      errorMessage: ''
    }
  },
  async mounted() {
    await this.loadUsuario()
  },
  methods: {
    async loadUsuario() {
      try {
        this.loading = true
        const userId = this.$route.params.id
        this.usuario = await userService.get(userId)
      } catch (error) {
        console.error('Error cargando usuario:', error)
        this.errorMessage = 'Error al cargar el usuario'
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    getStatusBadgeClass(status) {
      const classes = {
        active: 'bg-success',
        inactive: 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    },

    getStatusText(status) {
      const texts = {
        active: 'Activo',
        inactive: 'Inactivo'
      }
      return texts[status] || status
    }
  }
}
</script> 