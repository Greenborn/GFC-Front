<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-6">
        <h2>Concursos</h2>
      </div>
      <div class="col-md-6 text-end">
        <router-link to="/concursos/nuevo" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>Nuevo Concurso
        </router-link>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Buscar concursos..."
            v-model="searchTerm"
            @input="filterConcursos"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <select class="form-select d-inline-block w-auto" v-model="statusFilter" @change="filterConcursos">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="finished">Finalizados</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="filteredConcursos.length === 0" class="text-center">
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No se encontraron concursos
      </div>
    </div>

    <div v-else class="row">
      <div class="col-12 mb-4" v-for="concurso in filteredConcursos" :key="concurso.id">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ concurso.title || 'Sin título' }}</h5>
            <p class="card-text text-muted" v-if="concurso.sub_title">{{ concurso.sub_title }}</p>
            <p class="card-text">{{ concurso.description || 'Sin descripción' }}</p>
            
            <div class="row mb-3">
              <div class="col-6">
                <small class="text-muted">Inicio:</small><br>
                <strong>{{ formatDate(concurso.start_date) }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted">Fin:</small><br>
                <strong>{{ formatDate(concurso.end_date) }}</strong>
              </div>
            </div>

            <div class="mb-3">
              <span class="badge" :class="getStatusBadgeClass(concurso.status)">
                {{ getStatusText(concurso.status) }}
              </span>
            </div>
          </div>
          
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-between">
              <router-link :to="`/concursos/${concurso.id}`" class="btn btn-outline-primary btn-sm">
                <i class="bi bi-eye me-1"></i>Ver
              </router-link>
              <router-link :to="`/concursos/editar/${concurso.id}`" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-pencil me-1"></i>Editar
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import contestService from '../../services/contest.js'

export default {
  name: 'Concursos',
  data() {
    return {
      concursos: [],
      filteredConcursos: [],
      loading: true,
      errorMessage: '',
      searchTerm: '',
      statusFilter: ''
    }
  },
  async mounted() {
    await this.loadConcursos()
  },
  methods: {
    async loadConcursos() {
      try {
        this.loading = true
        const rawData = await contestService.getAll()
        
        // Mapear los datos para asegurar que tengan la estructura correcta
        this.concursos = rawData.map(concurso => ({
          id: concurso.id,
          title: concurso.title || concurso.name || concurso.nombre || 'Sin título',
          sub_title: concurso.sub_title || concurso.subtitle || concurso.subtitulo || '',
          description: concurso.description || concurso.descripcion || 'Sin descripción',
          start_date: concurso.start_date || concurso.fecha_inicio || '',
          end_date: concurso.end_date || concurso.fecha_fin || '',
          status: concurso.status || 'active',
          created_at: concurso.created_at,
          updated_at: concurso.updated_at
        }))
        
        this.filteredConcursos = [...this.concursos]
      } catch (error) {
        console.error('Error cargando concursos:', error)
        this.errorMessage = 'Error al cargar los concursos'
      } finally {
        this.loading = false
      }
    },

    filterConcursos() {
      this.filteredConcursos = this.concursos.filter(concurso => {
        const matchesSearch = !this.searchTerm || 
          (concurso.title && concurso.title.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (concurso.sub_title && concurso.sub_title.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (concurso.description && concurso.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
        
        const matchesStatus = !this.statusFilter || concurso.status === this.statusFilter
        
        return matchesSearch && matchesStatus
      })
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    },

    getStatusBadgeClass(status) {
      const classes = {
        active: 'bg-success',
        inactive: 'bg-secondary',
        finished: 'bg-warning'
      }
      return classes[status] || 'bg-secondary'
    },

    getStatusText(status) {
      const texts = {
        active: 'Activo',
        inactive: 'Inactivo',
        finished: 'Finalizado'
      }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.badge {
  font-size: 0.8rem;
}
</style> 