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
        <div 
          class="concurso-card position-relative d-flex flex-column justify-content-end"
          :style="concurso.image ? `background-image: url('${concurso.image}')` : ''"
        >
          <div class="concurso-overlay"></div>
          <span class="badge estado-badge mb-2" :class="getStatusBadgeClass(concurso)">
            {{ getStatusText(concurso) }}
          </span>
          <div class="concurso-content position-relative text-white p-4">
            <h4 class="fw-bold mb-2">{{ concurso.title || 'Sin título' }}</h4>
            <div class="mb-2">
              <small>Desde: {{ formatDate(concurso.start_date) }} - Hasta: {{ formatDate(concurso.end_date) }}</small>
            </div>
            <p class="mb-2">{{ concurso.description || 'Sin descripción' }}</p>
            <!-- Aquí puedes agregar categorías y secciones si están disponibles -->
            <div class="d-flex justify-content-end">
              <router-link :to="`/concursos/${concurso.id}`" class="btn btn-outline-light btn-sm fw-bold">
                VER CONCURSO
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
import configService from '../../services/config.js'

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
        this.concursos = rawData.map(concurso => {
          // Construir URL completa de la imagen
          let imageUrl = ''
          if (concurso.img_url) {
            imageUrl = configService.data.apiBaseUrl + concurso.img_url
          } else if (concurso.image || concurso.imagen || concurso.photo || concurso.foto) {
            imageUrl = configService.data.apiBaseUrl + (concurso.image || concurso.imagen || concurso.photo || concurso.foto)
          }
          
          return {
            id: concurso.id,
            title: concurso.title || concurso.name || concurso.nombre || 'Sin título',
            sub_title: concurso.sub_title || concurso.subtitle || concurso.subtitulo || '',
            description: concurso.description || concurso.descripcion || 'Sin descripción',
            image: imageUrl,
            start_date: concurso.start_date || concurso.fecha_inicio || '',
            end_date: concurso.end_date || concurso.fecha_fin || '',
            status: concurso.status || 'active',
            created_at: concurso.created_at,
            updated_at: concurso.updated_at
          }
        })
        
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

    getStatusBadgeClass(concurso) {
      if (!concurso.end_date) return 'bg-secondary';
      const cierre = new Date(concurso.end_date);
      const ahora = new Date();
      return cierre >= ahora ? 'bg-success' : 'bg-danger';
    },

    getStatusText(concurso) {
      if (!concurso.end_date) return 'Desconocido';
      const cierre = new Date(concurso.end_date);
      const ahora = new Date();
      return cierre >= ahora ? 'Activo' : 'Cerrado';
    },

    handleImageError(event) {
      // Ocultar la imagen si hay error al cargarla
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.concurso-card {
  min-height: 260px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  overflow: hidden;
  display: flex;
}
.concurso-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 1;
}
.concurso-content {
  position: relative;
  z-index: 2;
}
.estado-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  font-size: 1rem;
  padding: 0.4em 1em;
  border-radius: 1em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.btn-outline-light {
  border-color: #fff;
  color: #fff;
}
.btn-outline-light:hover {
  background: #fff;
  color: #222;
}
</style> 