<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-6">
        <h2>Organizaciones</h2>
      </div>
      <div class="col-md-6 text-end">
        <router-link to="/organizaciones/nuevo" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>Nuevo Fotoclub
        </router-link>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-4">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Buscar..." v-model="search" @input="filter" />
          <button class="btn btn-outline-secondary" type="button"><i class="bi bi-search"></i></button>
        </div>
      </div>
      <div class="col-md-4">
        <select class="form-select" v-model="typeFilter" @change="filter">
          <option value="">Todos los tipos</option>
          <option value="INTERNO">Interno</option>
          <option value="EXTERNO">Externo</option>
          <option value="EXTERNO_UNICEN">Externo UNICEN</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="filtered.length === 0" class="alert alert-info text-center">No se encontraron organizaciones</div>
    <div v-else class="row">
      <div class="col-md-6 col-lg-4 mb-4" v-for="f in filtered" :key="f.id">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ f.name }}</h5>
            <p class="card-text">{{ f.description }}</p>
            <p class="mb-1"><i class="bi bi-geo-alt"></i> {{ f.address }}</p>
            <p class="mb-1"><i class="bi bi-envelope"></i> {{ f.email }}</p>
            <p class="mb-1"><i class="bi bi-globe"></i> <a :href="f.website" target="_blank">{{ f.website }}</a></p>
            <span class="badge" :class="getTypeBadgeClass(f.organization_type)">
              {{ getTypeText(f.organization_type) }}
            </span>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between">
            <router-link :to="`/organizaciones/editar/${f.id}`" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-pencil"></i> Editar
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import fotoclubService from '../../services/fotoclub.js'

const fotoclubs = ref([])
const filtered = ref([])
const search = ref('')
const typeFilter = ref('')
const loading = ref(true)
const error = ref('')

const filter = () => {
  const s = search.value.toLowerCase()
  const filteredResults = fotoclubs.value.filter(f => {
    // Filtro de búsqueda
    const matchesSearch = f.name.toLowerCase().includes(s) ||
      (f.description && f.description.toLowerCase().includes(s)) ||
      (f.address && f.address.toLowerCase().includes(s))
    
    // Filtro de tipo
    const matchesType = !typeFilter.value || f.organization_type === typeFilter.value
    
    return matchesSearch && matchesType
  })
  
  // Ordenar: INTERNO primero, luego los demás
  filtered.value = filteredResults.sort((a, b) => {
    if (a.organization_type === 'INTERNO' && b.organization_type !== 'INTERNO') {
      return -1 // a va antes que b
    }
    if (a.organization_type !== 'INTERNO' && b.organization_type === 'INTERNO') {
      return 1 // b va antes que a
    }
    return 0 // mantener orden original entre elementos del mismo tipo
  })
}
onMounted(async () => {
  try {
    loading.value = true
    fotoclubs.value = await fotoclubService.getAll()
    // Aplicar filtro inicial para ordenar por prioridad
    filter()
  } catch (e) {
    error.value = 'Error al cargar las organizaciones'
  } finally {
    loading.value = false
  }
})

const getTypeBadgeClass = (type) => {
  const classes = {
    'INTERNO': 'bg-primary',
    'EXTERNO': 'bg-success',
    'EXTERNO_UNICEN': 'bg-warning'
  }
  return classes[type] || 'bg-secondary'
}

const getTypeText = (type) => {
  const texts = {
    'INTERNO': 'Interno',
    'EXTERNO': 'Externo',
    'EXTERNO_UNICEN': 'Externo UNICEN'
  }
  return texts[type] || type || 'Sin tipo'
}
</script> 