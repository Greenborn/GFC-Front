<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-6">
        <h2>{{ getTitulo() }}</h2>
      </div>
      <div class="col-md-6 text-end">
        <router-link 
          v-if="canCreateUser" 
          to="/usuarios/nuevo" 
          class="btn btn-primary"
        >
          <i class="fa fa-plus me-2"></i>Nuevo Usuario
        </router-link>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <div class="row mb-3">
      <div class="col-md-4">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar usuarios..."
            v-model="searchTerm"
            @input="filterUsuarios"
          >
          <span class="input-group-text">
            <i class="fa fa-search"></i>
          </span>
        </div>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="roleFilter" @change="filterUsuarios">
          <option value="">Todos los roles</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.type }}
          </option>
        </select>
      </div>
      <div class="col-md-2" v-if="isAdmin">
        <select class="form-select" v-model="fotoclubFilter" @change="filterUsuarios">
          <option value="">Todos los fotoclubs</option>
          <option v-for="fotoclub in fotoclubs" :key="fotoclub.id" :value="fotoclub.id">
            {{ fotoclub.name }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <select class="form-select" v-model="statusFilter" @change="filterUsuarios">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
      <div class="col-md-2">
        <button 
          class="btn btn-outline-secondary w-100" 
          @click="toggleFilters"
        >
          <i class="fa fa-filter me-1"></i>Filtros
        </button>
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
              <th>Usuario</th>
              <th v-if="isAdmin">Comisión Directiva</th>
              <th v-if="isAdmin">Rol</th>
              <th v-if="isAdmin">Fotoclub / Agrupación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="miembro in filteredUsuarios" :key="miembro.id">
              <td>
                <div class="d-flex align-items-center">
                  <usuario-img 
                    :src="miembro.img_url" 
                    size="sm"
                    class="me-2"
                  />
                  <div>
                    <div class="fw-bold">{{ miembro.name }} {{ miembro.last_name }}</div>
                    <small class="text-muted">@{{ miembro.user?.username }}</small>
                  </div>
                </div>
              </td>
              <td v-if="isAdmin">
                {{ miembro.executive_rol || 'No' }}
              </td>
              <td v-if="isAdmin">
                <span class="badge" :class="getRoleBadgeClass(miembro.user?.role_id)">
                  {{ getRoleType(miembro.user?.role_id) }}
                </span>
              </td>
              <td v-if="isAdmin">
                {{ getFotoclubName(miembro.fotoclub_id) }}
              </td>
              <td>
                <div class="btn-group" role="group" v-if="canEditUser(miembro)">
                  <router-link :to="`/perfil/${miembro.user?.id}`" class="btn btn-outline-primary btn-sm">
                    <i class="fa fa-eye"></i>
                  </router-link>
                  <router-link :to="`/usuarios/editar/${miembro.user?.id}`" class="btn btn-outline-secondary btn-sm">
                    <i class="fa fa-pencil"></i>
                  </router-link>
                  <button 
                    v-if="canDeleteUser(miembro)"
                    class="btn btn-outline-danger btn-sm" 
                    @click="deleteUsuario(miembro)"
                    :disabled="deleting === miembro.id"
                  >
                    <span v-if="deleting === miembro.id" class="spinner-border spinner-border-sm"></span>
                    <i v-else class="fa fa-trash"></i>
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
import rolificadorService from '../../services/rolificador.js'
import roleService from '../../services/role.js'
import fotoclubService from '../../services/fotoclub.js'
import authService from '../../services/auth.js'

export default {
  name: 'Usuarios',
  data() {
    return {
      miembros: [],
      filteredUsuarios: [],
      roles: [],
      fotoclubs: [],
      loading: true,
      deleting: null,
      errorMessage: '',
      searchTerm: '',
      statusFilter: '',
      roleFilter: '',
      fotoclubFilter: '',
      userLogged: null
    }
  },
  computed: {
    isAdmin() {
      return rolificadorService.isAdmin(this.userLogged)
    },
    canCreateUser() {
      return rolificadorService.canCreateUser(this.userLogged)
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        this.loading = true
        
        // Obtener usuario logueado
        this.userLogged = await authService.getUser()
        
        // Cargar datos según el rol
        const [miembros, roles, fotoclubs] = await Promise.all([
          rolificadorService.getMiembros(this.userLogged),
          roleService.getAll(),
          fotoclubService.getAll()
        ])
        
        this.miembros = miembros || []
        this.roles = roles || []
        this.fotoclubs = fotoclubs || []
        this.filteredUsuarios = [...this.miembros]
        
        // Debug: mostrar estructura de datos
        console.log('Miembros cargados:', this.miembros)
        console.log('Roles cargados:', this.roles)
        console.log('Fotoclubs cargados:', this.fotoclubs)
        if (this.miembros.length > 0) {
          console.log('Ejemplo de miembro:', this.miembros[0])
        }
        if (this.roles.length > 0) {
          console.log('Ejemplo de rol:', this.roles[0])
        }
        
      } catch (error) {
        console.error('Error cargando datos:', error)
        this.errorMessage = 'Error al cargar los datos'
      } finally {
        this.loading = false
      }
    },

    filterUsuarios() {
      this.filteredUsuarios = this.miembros.filter(miembro => {
        // Filtro de búsqueda
        const matchesSearch = !this.searchTerm || 
          `${miembro.name} ${miembro.last_name}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          miembro.user?.username.toLowerCase().includes(this.searchTerm.toLowerCase())
        
        // Filtro de rol
        const matchesRole = !this.roleFilter || miembro.user?.role_id == this.roleFilter
        
        // Filtro de fotoclub
        const matchesFotoclub = !this.fotoclubFilter || miembro.fotoclub_id == this.fotoclubFilter
        
        // Filtro de estado
        const matchesStatus = !this.statusFilter || miembro.user?.status === this.statusFilter
        
        return matchesSearch && matchesRole && matchesFotoclub && matchesStatus
      })
    },

    toggleFilters() {
      // Implementar toggle de filtros avanzados
      console.log('Toggle filters')
    },

    getTitulo() {
      return rolificadorService.getNombreUsuarios(this.userLogged?.role_id)
    },

    getRoleType(roleId) {
      return rolificadorService.getRoleType(roleId)
    },

    getFotoclubName(fotoclubId) {
      if (!fotoclubId) return 'Ninguno'
      const fotoclub = this.fotoclubs.find(f => f.id === fotoclubId)
      return fotoclub ? fotoclub.name : 'Ninguno'
    },

    canEditUser(miembro) {
      return rolificadorService.canEditUser(this.userLogged, miembro.user)
    },

    canDeleteUser(miembro) {
      return rolificadorService.canDeleteUser(this.userLogged, miembro.user)
    },

    async deleteUsuario(miembro) {
      if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        return
      }

      try {
        this.deleting = miembro.id
        // Eliminar usuario (el perfil se elimina en cascada)
        await userService.delete(miembro.user.id)
        this.miembros = this.miembros.filter(m => m.id !== miembro.id)
        this.filterUsuarios()
      } catch (error) {
        console.error('Error eliminando usuario:', error)
        this.errorMessage = 'Error al eliminar el usuario'
      } finally {
        this.deleting = null
      }
    },

    getRoleBadgeClass(roleId) {
      const classes = {
        1: 'bg-danger',    // Administrador
        2: 'bg-warning',   // Delegado
        3: 'bg-primary'    // Usuario
      }
      return classes[roleId] || 'bg-secondary'
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