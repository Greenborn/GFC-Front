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

    <div v-else-if="concurso" class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>{{ concurso.title }}</h2>
          <div>
            <router-link :to="`/concursos/editar/${concurso.id}`" class="btn btn-outline-primary me-2">
              <i class="bi bi-pencil me-1"></i>Editar
            </router-link>
            <router-link to="/concursos" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-1"></i>Volver
            </router-link>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h5 class="card-title">{{ concurso.sub_title }}</h5>
                <p class="card-text">{{ concurso.description }}</p>
                
                <div class="row">
                  <div class="col-md-6">
                    <strong>Fecha de inicio:</strong> {{ formatDate(concurso.start_date) }}
                  </div>
                  <div class="col-md-6">
                    <strong>Fecha de fin:</strong> {{ formatDate(concurso.end_date) }}
                  </div>
                </div>
              </div>
              <div class="col-md-4 text-end">
                <span class="badge fs-6" :class="getStatusBadgeClass(concurso.status)">
                  {{ getStatusText(concurso.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pestañas -->
        <ul class="nav nav-tabs" id="concursoTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="results-tab" data-bs-toggle="tab" data-bs-target="#results" type="button">
              Resultados
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="categories-tab" data-bs-toggle="tab" data-bs-target="#categories" type="button">
              Categorías
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="sections-tab" data-bs-toggle="tab" data-bs-target="#sections" type="button">
              Secciones
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="photos-tab" data-bs-toggle="tab" data-bs-target="#photos" type="button">
              Fotos
            </button>
          </li>
        </ul>

        <div class="tab-content" id="concursoTabsContent">
          <!-- Resultados -->
          <div class="tab-pane fade show active" id="results" role="tabpanel">
            <div class="card mt-3">
              <div class="card-body">
                <h5>Resultados del Concurso</h5>
                <div v-if="resultsLoading" class="text-center">
                  <div class="spinner-border spinner-border-sm"></div>
                </div>
                <div v-else-if="results.length === 0" class="text-center">
                  <p class="text-muted">No hay resultados disponibles</p>
                </div>
                <div v-else>
                  <div class="table-responsive">
                    <table class="table table-striped">
                      <thead>
                        <tr>
                          <th>Posición</th>
                          <th>Participante</th>
                          <th>Categoría</th>
                          <th>Sección</th>
                          <th>Puntuación</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="result in results" :key="result.id">
                          <td>{{ result.position }}</td>
                          <td>{{ result.participant_name }}</td>
                          <td>{{ result.category_name }}</td>
                          <td>{{ result.section_name }}</td>
                          <td>{{ result.score }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Categorías -->
          <div class="tab-pane fade" id="categories" role="tabpanel">
            <div class="card mt-3">
              <div class="card-body">
                <h5>Categorías del Concurso</h5>
                <div v-if="categoriesLoading" class="text-center">
                  <div class="spinner-border spinner-border-sm"></div>
                </div>
                <div v-else-if="categories.length === 0" class="text-center">
                  <p class="text-muted">No hay categorías definidas</p>
                </div>
                <div v-else class="row">
                  <div class="col-md-6 col-lg-4 mb-3" v-for="category in categories" :key="category.id">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title">{{ category.name }}</h6>
                        <p class="card-text text-muted">{{ category.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Secciones -->
          <div class="tab-pane fade" id="sections" role="tabpanel">
            <div class="card mt-3">
              <div class="card-body">
                <h5>Secciones del Concurso</h5>
                <div v-if="sectionsLoading" class="text-center">
                  <div class="spinner-border spinner-border-sm"></div>
                </div>
                <div v-else-if="sections.length === 0" class="text-center">
                  <p class="text-muted">No hay secciones definidas</p>
                </div>
                <div v-else class="row">
                  <div class="col-md-6 col-lg-4 mb-3" v-for="section in sections" :key="section.id">
                    <div class="card">
                      <div class="card-body">
                        <h6 class="card-title">{{ section.name }}</h6>
                        <p class="card-text text-muted">{{ section.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fotos -->
          <div class="tab-pane fade" id="photos" role="tabpanel">
            <div class="card mt-3">
              <div class="card-body">
                <h5>Fotos del Concurso</h5>
                <div v-if="photosLoading" class="text-center">
                  <div class="spinner-border spinner-border-sm"></div>
                </div>
                <div v-else-if="photos.length === 0" class="text-center">
                  <p class="text-muted">No hay fotos disponibles</p>
                </div>
                <div v-else class="row">
                  <div class="col-md-4 col-lg-3 mb-3" v-for="photo in photos" :key="photo.id">
                    <div class="card">
                      <img :src="photo.url" class="card-img-top" :alt="photo.title">
                      <div class="card-body">
                        <h6 class="card-title">{{ photo.title }}</h6>
                        <p class="card-text text-muted">{{ photo.author }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import contestService from '../../services/contest.js'

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