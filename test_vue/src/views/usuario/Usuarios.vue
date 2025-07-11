<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-6">
        <h2>Usuarios</h2>
      </div>
      <div class="col-md-6 text-end">
        <router-link to="/usuarios/nuevo" class="btn btn-primary">
          <i class="bi bi-person-plus me-2"></i>Nuevo Usuario
        </router-link>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar usuarios..."
            v-model="searchTerm"
            @input="filterUsuarios"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <select class="form-select d-inline-block w-auto" v-model="statusFilter" @change="filterUsuarios">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="filteredUsuarios.length === 0" class="text-center">
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No se encontraron usuarios
      </div>
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-striped table-hover">
          <thead class="table-dark">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Organización</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in filteredUsuarios" :key="usuario.id">
              <td>{{ usuario.id }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <img 
                    :src="usuario.avatar || '/default-avatar.png'" 
                    alt="Avatar" 
                    class="rounded-circle me-2" 
                    width="32" 
                    height="32"
                  >
                  {{ usuario.username }}
                </div>
              </td>
              <td>{{ usuario.first_name }} {{ usuario.last_name }}</td>
              <td>{{ usuario.email }}</td>
              <td>
                <span class="badge" :class="getRoleBadgeClass(usuario.role_name)">
                  {{ usuario.role_name || 'Sin rol' }}
                </span>
              </td>
              <td>{{ usuario.fotoclub_name || 'Sin organización' }}</td>
              <td>
                <span class="badge" :class="getStatusBadgeClass(usuario.status)">
                  {{ getStatusText(usuario.status) }}
                </span>
              </td>
              <td>
                <div class="btn-group" role="group">
                  <router-link :to="`/perfil/${usuario.id}`" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-eye"></i>
                  </router-link>
                  <router-link :to="`/usuarios/editar/${usuario.id}`" class="btn btn-outline-secondary btn-sm">
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button 
                    class="btn btn-outline-danger btn-sm" 
                    @click="deleteUsuario(usuario.id)"
                    :disabled="deleting === usuario.id"
                  >
                    <span v-if="deleting === usuario.id" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import userService from '../../services/user.js'

export default {
  name: 'Usuarios',
  data() {
    return {
      usuarios: [],
      filteredUsuarios: [],
      loading: true,
      deleting: null,
      errorMessage: '',
      searchTerm: '',
      statusFilter: ''
    }
  },
  async mounted() {
    await this.loadUsuarios()
  },
  methods: {
    async loadUsuarios() {
      try {
        this.loading = true
        this.usuarios = await userService.getAll()
        this.filteredUsuarios = [...this.usuarios]
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        this.errorMessage = 'Error al cargar los usuarios'
      } finally {
        this.loading = false
      }
    },

    filterUsuarios() {
      this.filteredUsuarios = this.usuarios.filter(usuario => {
        const matchesSearch = !this.searchTerm || 
          usuario.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          usuario.first_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          usuario.last_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          usuario.email.toLowerCase().includes(this.searchTerm.toLowerCase())
        
        const matchesStatus = !this.statusFilter || usuario.status === this.statusFilter
        
        return matchesSearch && matchesStatus
      })
    },

    async deleteUsuario(id) {
      if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return
      }

      try {
        this.deleting = id
        await userService.delete(id)
        this.usuarios = this.usuarios.filter(u => u.id !== id)
        this.filterUsuarios()
      } catch (error) {
        console.error('Error eliminando usuario:', error)
        this.errorMessage = 'Error al eliminar el usuario'
      } finally {
        this.deleting = null
      }
    },

    getRoleBadgeClass(role) {
      const classes = {
        'admin': 'bg-danger',
        'user': 'bg-primary',
        'moderator': 'bg-warning'
      }
      return classes[role] || 'bg-secondary'
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

<style scoped>
.table th {
  font-weight: 600;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}
</style> 