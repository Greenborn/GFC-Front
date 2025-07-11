<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-12">
        <h2>Estadísticas</h2>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-4">
        <select v-model="selectedContest" class="form-select" @change="loadStats">
          <option value="">Seleccionar concurso</option>
          <option v-for="c in contests" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else class="row">
      <div class="col-md-3 mb-4" v-for="stat in stats" :key="stat.label">
        <div class="card text-center">
          <div class="card-body">
            <h3 class="card-title text-primary">{{ stat.value }}</h3>
            <p class="card-text">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="chartData.length > 0" class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Distribución por Categoría</h5>
            <div class="row">
              <div class="col-md-6" v-for="item in chartData" :key="item.category">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>{{ item.category }}</span>
                  <span class="badge bg-primary">{{ item.count }}</span>
                </div>
                <div class="progress">
                  <div class="progress-bar" :style="{ width: item.percentage + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import contestService from '../../services/contest.js'
import axios from 'axios'
import configService from '../../services/config.js'

const contests = ref([])
const stats = ref([])
const chartData = ref([])
const selectedContest = ref('')
const loading = ref(true)
const error = ref('')

const loadContests = async () => {
  try {
    contests.value = await contestService.getAll()
  } catch (e) {
    error.value = 'Error al cargar concursos'
  }
}

const loadStats = async () => {
  if (!selectedContest.value) {
    stats.value = []
    chartData.value = []
    return
  }
  try {
    loading.value = true
    const res = await axios.get(configService.apiUrl(`statistics?contest_id=${selectedContest.value}`))
    const data = res.data
    
    stats.value = [
      { label: 'Total Participantes', value: data.total_participants || 0 },
      { label: 'Total Fotos', value: data.total_photos || 0 },
      { label: 'Categorías', value: data.categories_count || 0 },
      { label: 'Secciones', value: data.sections_count || 0 }
    ]
    
    chartData.value = data.category_distribution || []
  } catch (e) {
    error.value = 'Error al cargar estadísticas'
  } finally {
    loading.value = false
  }
}

onMounted(loadContests)
</script> 