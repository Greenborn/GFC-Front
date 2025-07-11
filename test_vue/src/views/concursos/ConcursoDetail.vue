<template>
  <div class="container-fluid px-4 py-3">
    <div class="row mb-3 align-items-center">
      <div class="col-auto">
        <router-link to="/concursos" class="btn btn-link text-dark p-0 fw-bold">
          <i class="fa fa-arrow-left me-2"></i> VOLVER
        </router-link>
      </div>
      <div class="col text-center">
        <h4 class="mb-0">Concurso</h4>
      </div>
      <div class="col-auto"></div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs justify-content-center mb-3" id="concursoTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button">
          <i class="fa fa-info-circle"></i><br>Información
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="judges-tab" data-bs-toggle="tab" data-bs-target="#judges" type="button">
          <i class="fa fa-award"></i><br>Jueces
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="participants-tab" data-bs-toggle="tab" data-bs-target="#participants" type="button">
          <i class="fa fa-users"></i><br>Concursantes
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="photos-tab" data-bs-toggle="tab" data-bs-target="#photos" type="button">
          <i class="fa fa-image"></i><br>Fotografías
        </button>
      </li>
    </ul>

    <div class="tab-content" id="concursoTabsContent">
      <!-- Información -->
      <div class="tab-pane fade show active" id="info" role="tabpanel">
        <div class="card shadow-sm">
          <div class="card-body position-relative">
            <!-- Botones editar/eliminar -->
            <div class="position-absolute top-0 end-0 mt-3 me-3 d-flex gap-2">
              <button class="btn btn-primary btn-sm" title="Editar"><i class="fa fa-pen"></i></button>
              <button class="btn btn-danger btn-sm" title="Eliminar"><i class="fa fa-trash"></i></button>
            </div>
            <h5 class="fw-bold">{{ concurso?.title }}</h5>
            <div class="text-muted mb-2">
              Desde: {{ formatDate(concurso?.start_date) }} - Hasta: {{ formatDate(concurso?.end_date) }}
            </div>
            <div class="mb-3">{{ concurso?.description }}</div>
            <div class="mb-3">
              <span class="fw-bold">Reglamento:</span>
              <a v-if="reglamentoUrl" :href="reglamentoUrl" target="_blank" class="btn btn-link btn-sm p-0 align-baseline">
                <i class="fa fa-link"></i>
              </a>
            </div>
            <div class="mb-3">
              <span class="fw-bold">Categorías:</span>
              <span v-for="cat in concurso?.categories || []" :key="cat" class="badge bg-light text-dark fw-semibold me-2">{{ cat }}</span>
            </div>
            <div class="mb-3">
              <span class="fw-bold">Secciones:</span>
              <span v-for="sec in concurso?.sections || []" :key="sec" class="badge bg-light text-dark fw-semibold me-2">{{ sec }}</span>
            </div>
            <div class="mb-3">
              <span class="fw-bold">Grabaciones:</span>
            </div>
            <div class="d-flex justify-content-end">
              <button class="btn btn-primary mt-2">
                DESCARGAR FOTOGRAFÍAS <i class="fa fa-share ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Aquí irían los otros tabs (Jueces, Concursantes, Fotografías) -->
    </div>
  </div>
</template>

<script>
import contestService from '../../services/contest.js'
import configService from '../../services/config.js'

export default {
  name: 'ConcursoDetail',
  data() {
    return {
      concurso: null,
      results: [],
      categories: [],
      sections: [],
      photos: [],
      loading: true,
      resultsLoading: false,
      categoriesLoading: false,
      sectionsLoading: false,
      photosLoading: false,
      errorMessage: ''
    }
  },
  computed: {
    reglamentoUrl() {
      if (!this.concurso || !this.concurso.rules_url) return '';
      // Si la URL ya es absoluta, la retorna tal cual
      if (/^https?:\/\//.test(this.concurso.rules_url)) return this.concurso.rules_url;
      // Si es relativa, la concatena a la base de la API
      return configService.data.apiBaseUrl + this.concurso.rules_url;
    }
  },
  async mounted() {
    await this.loadConcurso()
  },
  methods: {
    async loadConcurso() {
      try {
        this.loading = true
        const concursoId = this.$route.params.id
        this.concurso = await contestService.get(concursoId)
        // await this.loadResults() // Quitar esta línea para evitar la consulta automática
      } catch (error) {
        console.error('Error cargando concurso:', error)
        this.errorMessage = 'Error al cargar el concurso'
      } finally {
        this.loading = false
      }
    },

    async loadResults() {
      try {
        this.resultsLoading = true
        const concursoId = this.$route.params.id
        this.results = await contestService.getContestResults(concursoId)
      } catch (error) {
        console.error('Error cargando resultados:', error)
      } finally {
        this.resultsLoading = false
      }
    },

    async loadCategories() {
      try {
        this.categoriesLoading = true
        const concursoId = this.$route.params.id
        this.categories = await contestService.getContestCategories(concursoId)
      } catch (error) {
        console.error('Error cargando categorías:', error)
      } finally {
        this.categoriesLoading = false
      }
    },

    async loadSections() {
      try {
        this.sectionsLoading = true
        const concursoId = this.$route.params.id
        this.sections = await contestService.getContestSections(concursoId)
      } catch (error) {
        console.error('Error cargando secciones:', error)
      } finally {
        this.sectionsLoading = false
      }
    },

    async loadPhotos() {
      try {
        this.photosLoading = true
        const concursoId = this.$route.params.id
        this.photos = await contestService.getCompressedPhotos(concursoId)
      } catch (error) {
        console.error('Error cargando fotos:', error)
      } finally {
        this.photosLoading = false
      }
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
  },

  watch: {
    '$route.params.id': {
      handler() {
        this.loadConcurso()
      }
    }
  }
}
</script>

<style scoped>
.nav-tabs .nav-link {
  color: var(--secondary-color);
}

.nav-tabs .nav-link.active {
  color: var(--primary-color);
  font-weight: 500;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}
</style> 