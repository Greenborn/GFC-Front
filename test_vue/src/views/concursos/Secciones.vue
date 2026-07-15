<template>
  <div class="container">
    <div class="row mb-4 align-items-center">
      <div class="col-md-6">
        <h2 class="mb-0"><i class="bi bi-columns-gap me-2"></i>Secciones</h2>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-primary" @click="showForm = true; editSection(null)">
          <i class="bi bi-plus-circle me-2"></i>Nueva Sección
        </button>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
          <input v-model="search" @input="filter" type="text" class="form-control" placeholder="Buscar secciones..." />
        </div>
      </div>
      <div class="col-md-6 text-end">
        <span class="text-muted">{{ filtered.length }} sección(es)</span>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border text-primary"></div></div>
    <div v-else-if="filtered.length === 0" class="alert alert-info text-center"><i class="bi bi-info-circle me-2"></i>No se encontraron secciones</div>
    <div v-else class="row">
      <div class="col-md-6 col-lg-4 mb-4" v-for="s in filtered" :key="s.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">{{ s.name }}</h5>
              <span class="badge rounded-pill" :class="s.status==='active' ? 'bg-success' : 'bg-secondary'">
                <i :class="s.status==='active' ? 'bi bi-check-circle' : 'bi bi-x-circle'" class="me-1"></i>
                {{ s.status==='active' ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <p class="card-text text-muted small mb-0">{{ s.description || 'Sin descripción' }}</p>
          </div>
          <div class="card-footer bg-transparent border-top-0 d-flex justify-content-end gap-2">
            <button class="btn btn-outline-primary btn-sm" @click="editSection(s)">
              <i class="bi bi-pencil"></i> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger mt-3"><i class="bi bi-exclamation-triangle me-2"></i>{{ error }}</div>

    <!-- Modal -->
    <div class="modal fade show" tabindex="-1" style="display:block;" v-if="showForm">
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title">
              <i :class="sectionForm.id ? 'bi bi-pencil-square' : 'bi bi-plus-circle'" class="me-2"></i>
              {{ sectionForm.id ? 'Editar Sección' : 'Nueva Sección' }}
            </h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSection">
              <div class="mb-3">
                <label class="form-label fw-semibold">Nombre <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-tag"></i></span>
                  <input v-model="sectionForm.name" type="text" class="form-control" placeholder="Ej: Blanco y Negro" required />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Descripción</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-text-paragraph"></i></span>
                  <textarea v-model="sectionForm.description" class="form-control" rows="3" placeholder="Descripción de la sección..."></textarea>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Estado</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-toggle-on"></i></span>
                  <select v-model="sectionForm.status" class="form-select">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
              <div v-if="formError" class="alert alert-danger d-flex align-items-center gap-2 py-2">
                <i class="bi bi-exclamation-circle"></i>
                <span>{{ formError }}</span>
              </div>
              <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" class="btn btn-outline-secondary" @click="closeForm">
                  <i class="bi bi-x-lg me-1"></i>Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else :class="sectionForm.id ? 'bi bi-check-lg' : 'bi bi-plus-lg'" class="me-1"></i>
                  {{ saving ? 'Guardando...' : (sectionForm.id ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showForm" class="modal-backdrop fade show"></div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import sectionService from '../../services/section.js'

const sections = ref([])
const filtered = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')

const showForm = ref(false)
const sectionForm = ref({ name: '', description: '', status: 'active' })
const saving = ref(false)
const formError = ref('')

const filter = () => {
  const s = search.value.toLowerCase()
  filtered.value = sections.value.filter(sec =>
    sec.name.toLowerCase().includes(s) ||
    (sec.description && sec.description.toLowerCase().includes(s))
  )
}
const editSection = (sec) => {
  if (sec) sectionForm.value = { ...sec }
  else sectionForm.value = { name: '', description: '', status: 'active' }
  formError.value = ''
  showForm.value = true
}
const closeForm = () => { showForm.value = false }
const saveSection = async () => {
  try {
    saving.value = true
    formError.value = ''
    if (sectionForm.value.id) {
      await sectionService.post(sectionForm.value, sectionForm.value.id)
    } else {
      await sectionService.post(sectionForm.value)
    }
    await loadSections()
    showForm.value = false
  } catch (e) {
    formError.value = 'Error al guardar la sección'
  } finally {
    saving.value = false
  }
}
const loadSections = async () => {
  try {
    loading.value = true
    sections.value = await sectionService.getAll()
    filtered.value = [...sections.value]
  } catch (e) {
    error.value = 'Error al cargar secciones'
  } finally {
    loading.value = false
  }
}
onMounted(loadSections)
</script> 