<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-12">
        <h2>Notificaciones</h2>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="notificaciones.length === 0" class="alert alert-info text-center">No hay notificaciones</div>
    <div v-else class="row">
      <div class="col-12">
        <ul class="list-group">
          <li v-for="n in notificaciones" :key="n.id" class="list-group-item d-flex align-items-center">
            <img v-if="n.icon" :src="getIcon(n.icon)" alt="icono" class="me-3" style="width:32px;height:32px;">
            <div class="flex-fill">
              <div class="fw-bold">{{ n.title }}</div>
              <div class="text-muted small">{{ n.message }}</div>
              <div class="text-end text-secondary small">{{ formatDate(n.created_at) }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import configService from '../services/config.js'

const notificaciones = ref([])
const loading = ref(true)
const error = ref('')

const getIcon = (icon) => {
  // Usa los mismos assets que el Angular, por ejemplo: /assets/icon/notification.svg
  return `/assets/icon/${icon}`
}
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('es-ES')
}
onMounted(async () => {
  try {
    loading.value = true
    // Suponiendo endpoint /notifications
    const res = await axios.get(configService.apiUrl('notifications'))
    notificaciones.value = res.data.items || []
  } catch (e) {
    error.value = 'Error al cargar notificaciones'
  } finally {
    loading.value = false
  }
})
</script> 