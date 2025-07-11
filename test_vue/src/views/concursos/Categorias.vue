<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-6">
        <h2>Categorías</h2>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-primary" @click="showForm = true; editCategory(null)">
          <i class="bi bi-plus-circle me-2"></i>Nueva Categoría
        </button>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="filtered.length === 0" class="alert alert-info text-center">No se encontraron categorías</div>
    <div v-else class="row">
      <div class="col-md-6 col-lg-4 mb-4" v-for="c in filtered" :key="c.id">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ c.name }}</h5>
            <p class="card-text">{{ c.description }}</p>
            <span class="badge bg-success" v-if="c.status==='active'">Activo</span>
            <span class="badge bg-secondary" v-else>Inactivo</span>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between">
            <button class="btn btn-outline-secondary btn-sm" @click="editCategory(c)"><i class="bi bi-pencil"></i> Editar</button>
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
            <h5 class="modal-title">{{ categoryForm.id ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
            <button type="button" class="btn-close" @click="closeForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3">
                <label class="form-label">Nombre *</label>
                <input v-model="categoryForm.name" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Descripción</label>
                <textarea v-model="categoryForm.description" class="form-control" rows="2"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Estado</label>
                <select v-model="categoryForm.status" class="form-select">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeForm">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ saving ? 'Guardando...' : (categoryForm.id ? 'Actualizar' : 'Crear') }}
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
import categoryService from '../../services/category.js'

const categories = ref([])
const filtered = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')

const showForm = ref(false)
const categoryForm = ref({ name: '', description: '', status: 'active' })
const saving = ref(false)
const formError = ref('')

const filter = () => {
  const s = search.value.toLowerCase()
  filtered.value = categories.value.filter(cat =>
    cat.name.toLowerCase().includes(s) ||
    (cat.description && cat.description.toLowerCase().includes(s))
  )
}
const editCategory = (cat) => {
  if (cat) categoryForm.value = { ...cat }
  else categoryForm.value = { name: '', description: '', status: 'active' }
  formError.value = ''
  showForm.value = true
}
const closeForm = () => { showForm.value = false }
const saveCategory = async () => {
  try {
    saving.value = true
    formError.value = ''
    if (categoryForm.value.id) {
      await categoryService.post(categoryForm.value, categoryForm.value.id)
    } else {
      await categoryService.post(categoryForm.value)
    }
    await loadCategories()
    showForm.value = false
  } catch (e) {
    formError.value = 'Error al guardar la categoría'
  } finally {
    saving.value = false
  }
}
const loadCategories = async () => {
  try {
    loading.value = true
    categories.value = await categoryService.getAll()
    filtered.value = [...categories.value]
  } catch (e) {
    error.value = 'Error al cargar categorías'
  } finally {
    loading.value = false
  }
}
onMounted(loadCategories)
</script> 