<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-12">
        <h2>Folder {{ folderId }}</h2>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Contenido del Folder</h5>
            <p class="card-text">ID del folder: {{ folderId }}</p>
            <div v-if="folderData">
              <pre>{{ JSON.stringify(folderData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import configService from '../services/config.js'

const route = useRoute()
const folderId = ref(route.params.id)
const folderData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    loading.value = true
    const res = await axios.get(configService.apiUrl(`folder/${folderId.value}`))
    folderData.value = res.data
  } catch (e) {
    error.value = 'Error al cargar el folder'
  } finally {
    loading.value = false
  }
})
</script> 