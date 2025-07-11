<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4>{{ isEditing ? 'Editar Fotoclub' : 'Nuevo Fotoclub' }}</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="save">
              <div class="mb-3">
                <label for="name" class="form-label">Nombre *</label>
                <input id="name" v-model="fotoclub.name" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Descripción</label>
                <textarea id="description" v-model="fotoclub.description" class="form-control" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Dirección</label>
                <input id="address" v-model="fotoclub.address" type="text" class="form-control" />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input id="email" v-model="fotoclub.email" type="email" class="form-control" />
              </div>
              <div class="mb-3">
                <label for="website" class="form-label">Sitio Web</label>
                <input id="website" v-model="fotoclub.website" type="url" class="form-control" />
              </div>
              <div class="mb-3">
                <label for="status" class="form-label">Estado</label>
                <select id="status" v-model="fotoclub.status" class="form-select">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div class="d-flex justify-content-between">
                <router-link to="/organizaciones" class="btn btn-secondary">
                  <i class="bi bi-arrow-left me-1"></i>Cancelar
                </router-link>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                </button>
              </div>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import fotoclubService from '../../services/fotoclub.js'

const route = useRoute()
const router = useRouter()
const fotoclub = ref({
  name: '', description: '', address: '', email: '', website: '', status: 'active'
})
const loading = ref(false)
const error = ref('')
const isEditing = computed(() => !!route.params.id)

onMounted(async () => {
  if (isEditing.value) {
    try {
      loading.value = true
      fotoclub.value = await fotoclubService.get(route.params.id)
    } catch (e) {
      error.value = 'Error al cargar el fotoclub'
    } finally {
      loading.value = false
    }
  }
})

const save = async () => {
  try {
    loading.value = true
    error.value = ''
    if (isEditing.value) {
      await fotoclubService.post(fotoclub.value, route.params.id)
    } else {
      await fotoclubService.post(fotoclub.value)
    }
    router.push('/organizaciones')
  } catch (e) {
    error.value = 'Error al guardar el fotoclub'
  } finally {
    loading.value = false
  }
}
</script> 