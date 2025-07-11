<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-12">
        <h2>Ranking de Concursos</h2>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-4">
        <select v-model="selectedContest" class="form-select" @change="loadRanking">
          <option value="">Seleccionar concurso</option>
          <option v-for="c in contests" :key="c.id" :value="c.id">{{ c.title }}</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="text-center"><div class="spinner-border"></div></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="ranking.length === 0" class="alert alert-info text-center">No hay datos de ranking disponibles</div>
    <div v-else class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Ranking</h5>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead class="table-dark">
                  <tr>
                    <th>Posición</th>
                    <th>Participante</th>
                    <th>Categoría</th>
                    <th>Sección</th>
                    <th>Puntuación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, index) in ranking" :key="r.id">
                    <td>
                      <span v-if="index < 3" class="badge" :class="getPositionBadge(index)">
                        {{ index + 1 }}
                      </span>
                      <span v-else>{{ index + 1 }}</span>
                    </td>
                    <td>{{ r.participant_name }}</td>
                    <td>{{ r.category_name }}</td>
                    <td>{{ r.section_name }}</td>
                    <td><strong>{{ r.score }}</strong></td>
                  </tr>
                </tbody>
              </table>
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
const ranking = ref([])
const selectedContest = ref('')
const loading = ref(true)
const error = ref('')

const getPositionBadge = (index) => {
  const badges = ['bg-warning', 'bg-secondary', 'bg-bronze']
  return badges[index] || ''
}

const loadContests = async () => {
  try {
    contests.value = await contestService.getAll()
  } catch (e) {
    error.value = 'Error al cargar concursos'
  }
}

const loadRanking = async () => {
  if (!selectedContest.value) {
    ranking.value = []
    return
  }
  try {
    loading.value = true
    const res = await axios.get(configService.apiUrl(`ranking?contest_id=${selectedContest.value}`))
    ranking.value = res.data.items || []
  } catch (e) {
    error.value = 'Error al cargar ranking'
  } finally {
    loading.value = false
  }
}

onMounted(loadContests)
</script>
<style scoped>
.bg-bronze { background-color: #cd7f32 !important; }
</style> 