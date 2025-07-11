<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-6">
        <h2>Secciones</h2>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-primary" @click="showForm = true; editSection(null)">
          <i class="bi bi-plus-circle me-2"></i>Nueva Sección
        </button>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="filtered.length === 0" class="alert alert-info text-center">No se encontraron secciones</div>
    <div v-else class="row">
      <div class="col-md-6 col-lg-4 mb-4" v-for="s in filtered" :key="s.id">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ s.name }}</h5>
            <p class="card-text">{{ s.description }}</p>
            <span class="badge bg-success" v-if="s.status==='active'">Activo</span>
            <span class="badge bg-secondary" v-else>Inactivo</span>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between">
            <button class="btn btn-outline-secondary btn-sm" @click="editSection(s)"><i class="bi bi-pencil"></i> Editar</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

    <!-- Formulario modal -->
    <div class="modal fade show" tabindex="-1" style="display:block;" v-if="showForm">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ sectionForm.id ? 'Editar Sección' : 'Nueva Sección' }}</h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSection">
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input v-model="sectionForm.name" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea v-model="sectionForm.description" class="form-control" rows="2"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Estado</label>
                <select v-model="sectionForm.status" class="form-select">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeForm">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ saving ? 'Guardando...' : (sectionForm.id ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
            <div v-if="formError" class="alert alert-danger mt-3">{{ formError }}</div>
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