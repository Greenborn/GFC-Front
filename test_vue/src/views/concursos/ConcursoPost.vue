<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4>{{ isEditing ? 'Editar Concurso' : 'Nuevo Concurso' }}</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveConcurso">
              <div class="row">
                <div class="col-md-8 mb-3">
                  <label for="title" class="form-label">Título *</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="title" 
                    v-model="concurso.title"
                    required
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label for="status" class="form-label">Estado</label>
                  <select class="form-select" id="status" v-model="concurso.status">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label for="sub_title" class="form-label">Subtítulo</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="sub_title" 
                  v-model="concurso.sub_title"
                >
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">Descripción</label>
                <textarea 
                  class="form-control" 
                  id="description" 
                  rows="4"
                  v-model="concurso.description"
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="start_date" class="form-label">Fecha de inicio *</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="start_date" 
                    v-model="concurso.start_date"
                    required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="end_date" class="form-label">Fecha de fin *</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="end_date" 
                    v-model="concurso.end_date"
                    required
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
import contestService from '../../services/contest.js'

export default {
  name: 'ConcursoPost',
  data() {
    return {
      concurso: {
        title: '',
        sub_title: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'active'
      },
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
    if (this.isEditing) {
      await this.loadConcurso()
    }
  },
  methods: {
    async loadConcurso() {
      try {
        const id = this.$route.params.id
        const concurso = await contestService.get(id)
        this.concurso = { ...concurso }
      } catch (error) {
        console.error('Error cargando concurso:', error)
        this.errorMessage = 'Error al cargar el concurso'
      }
    },

    async saveConcurso() {
      try {
        this.loading = true
        this.errorMessage = ''

        if (this.isEditing) {
          await contestService.post(this.concurso, this.$route.params.id)
        } else {
          await contestService.post(this.concurso)
        }

        this.$router.push('/concursos')
      } catch (error) {
        console.error('Error guardando concurso:', error)
        this.errorMessage = 'Error al guardar el concurso'
      } finally {
        this.loading = false
      }
    }
  }
}
</script> 