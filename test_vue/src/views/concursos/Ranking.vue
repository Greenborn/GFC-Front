<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-12">
        <h1>Ranking - {{ anio }}</h1>
      </div>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <!-- Ranking por Participante -->
      <div class="row mb-4">
        <div class="col-12">
          <h2>Por participante</h2>
        </div>
      </div>

      <div v-for="r in ranking.profiles" :key="r.id_categoria" class="mb-5">
        <div class="row mb-3">
          <div class="col-12">
            <h3>{{ r.nombre_categoria }}</h3>
          </div>
        </div>

        <!-- Selector de Sección -->
        <div class="row mb-3">
          <div class="col-12">
            <div class="btn-group" role="group">
              <button 
                type="button" 
                class="btn" 
                :class="r.pestania_seccion == -1 ? 'btn-primary' : 'btn-outline-primary'"
                @click="r.pestania_seccion = -1"
              >
                General (Total de secciones)
              </button>
              <button 
                v-for="(btnSec, iSec) in r.ranks_seccion" 
                :key="btnSec.id_seccion"
                type="button" 
                class="btn" 
                :class="r.pestania_seccion == iSec ? 'btn-primary' : 'btn-outline-primary'"
                @click="r.pestania_seccion = iSec"
              >
                {{ btnSec.nombre_seccion }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de Participantes -->
        <div class="table-responsive">
          <table class="table table-striped">
            <thead class="table-dark">
              <tr>
                <th>Posición</th>
                <th>Participante</th>
                <th>Puntaje</th>
                <th>Premios</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rg in obtener_filas(r)" :key="rg.profile_id">
                <td># {{ rg.posicion_temporada }}</td>
                <td class="text-capitalize">{{ rg.name }}</td>
                <td>
                  {{ rg.puntaje_temporada }}
                  <span 
                    v-if="rg.score_total >= 200 && r.nombre_categoria == 'Estímulo' && r.pestania_seccion != -1"
                    class="badge bg-warning ms-2"
                  >
                    Habilitado a participar en primera
                  </span>
                </td>
                <td>
                  <span 
                    v-for="premio in rg.premios_temporada" 
                    :key="premio.nombre"
                    class="badge bg-secondary me-1"
                  >
                    {{ premio.cantidad }} - {{ premio.nombre }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Ranking por Fotoclub -->
      <div class="row mb-4">
        <div class="col-12">
          <h2>Por fotoclub</h2>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th>Posición</th>
              <th>Fotoclub</th>
              <th>Puntaje</th>
              <th>Porcentaje Efectividad</th>
              <th>Premios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in ranking.fotoclubs" :key="r.id">
              <td># {{ r.posicion_temporada }}</td>
              <td class="text-capitalize">{{ r.name }}</td>
              <td>{{ r.puntaje_temporada }}</td>
              <td>{{ r.porc_efectividad_anual.porcentaje.toFixed(1) }} %</td>
              <td>
                <span 
                  v-for="premio in r.premios_temporada" 
                  :key="premio.nombre"
                  class="badge bg-secondary me-1"
                >
                  {{ premio.cantidad }} - {{ premio.nombre }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import rankingService from '../../services/ranking.js'

export default {
  name: 'Ranking',
  data() {
    return {
      ranking: {
        profiles: [],
        fotoclubs: []
      },
      sentido_orden: -1,
      anio: new Date().getFullYear(),
      loading: true,
      error: ''
    }
  },
  async mounted() {
    await this.cargarRanking()
  },
  methods: {
    obtener_filas(categoria) {
      if (categoria.pestania_seccion == -1) {
        return categoria.profiles
      }
      return categoria.ranks_seccion[categoria.pestania_seccion].profiles
    },

    procesar_ranking(r) {
      let ranks = { 'profiles': [], 'fotoclubs': r.fotoclubs }
      let cats = {}
      let sects = {}

      // Se crea estructura de ranking a partir de categorias
      for (let c = 0; c < r.Category.length; c++) {
        cats[r.Category[c].id] = r.Category[c]
        ranks.profiles.push({
          nombre_categoria: r.Category[c].name,
          id_categoria: r.Category[c].id,
          profiles: [],
          pestania_seccion: -1,
          ranks_seccion: []
        })
      }

      // Se crea estructura de rankings de secciones
      for (let c = 0; c < r.Section.length; c++) {
        sects[r.Section[c].id] = r.Section[c]

        for (let i = 0; i < ranks.profiles.length; i++) {
          ranks.profiles[i].ranks_seccion.push({
            nombre_seccion: sects[r.Section[c].id].name,
            id_seccion: r.Section[c].id,
            profiles: []
          })
        }
      }

      // Se asignan los perfiles a los rankings
      for (let c = 0; c < r.profiles.length; c++) {
        let perfil = r.profiles[c]
        perfil.premios_temporada = JSON.parse(perfil.premios_temporada)
        perfil['posicion_temporada'] = 0
        if (perfil.puntaje_temporada > 0) {
          // Se asigna un perfil al ranking de la categoria que le corresponde
          for (let i = 0; i < ranks.profiles.length; i++) {
            if (ranks.profiles[i].id_categoria == perfil.category_id) {
              // Si existe el perfil se suman los puntos, caso contrario se inserta registro nuevo
              let encontrado = false
              for (let j = 0; j < ranks.profiles[i].profiles.length; j++) {
                if (ranks.profiles[i].profiles[j].profile_id == perfil.profile_id) {
                  ranks.profiles[i].profiles[j].puntaje_temporada += perfil.puntaje_temporada
                  ranks.profiles[i].profiles[j].score_total += perfil.score_total
                  ranks.profiles[i].profiles[j].premios_temporada = this.sumar_premios(ranks.profiles[i].profiles[j].premios_temporada, perfil.premios_temporada)
                  encontrado = true
                  break
                }
              }
              if (!encontrado)
                ranks.profiles[i].profiles.push({ ...perfil })

              // Se asigna el perfil al sub-ranking de la sección
              for (let j = 0; j < ranks.profiles[i].ranks_seccion.length; j++) {
                if (ranks.profiles[i].ranks_seccion[j].id_seccion == perfil.section_id) {
                  ranks.profiles[i].ranks_seccion[j].profiles.push({ ...perfil })
                  break
                }
              }
              break
            }
          }
        }
      }

      // Se ordenan los perfiles en los rankings
      for (let c = 0; c < ranks.profiles.length; c++) {
        ranks.profiles[c].profiles.sort((item1, item2) => {
          if (item1.puntaje_temporada < item2.puntaje_temporada) {
            return -1 * this.sentido_orden
          }
          if (item1.puntaje_temporada > item2.puntaje_temporada) {
            return 1 * this.sentido_orden
          }
          return 0
        })

        for (let i = 0; i < ranks.profiles[c].ranks_seccion.length; i++) {
          ranks.profiles[c].ranks_seccion[i].profiles.sort((item1, item2) => {
            if (item1.puntaje_temporada < item2.puntaje_temporada) {
              return -1 * this.sentido_orden
            }
            if (item1.puntaje_temporada > item2.puntaje_temporada) {
              return 1 * this.sentido_orden
            }
            return 0
          })
        }
      }

      // Se asignan los numeros de posición
      for (let c = 0; c < ranks.profiles.length; c++) {
        let pos_categoria = 1
        for (let i = 0; i < ranks.profiles[c].profiles.length; i++) {
          ranks.profiles[c].profiles[i].posicion_temporada = pos_categoria
          ranks.profiles[c].profiles[i].premios_temporada = this.arreglo_premios(ranks.profiles[c].profiles[i].premios_temporada)
          if ((i + 1 < ranks.profiles[c].profiles.length) && (ranks.profiles[c].profiles[i].puntaje_temporada != ranks.profiles[c].profiles[i + 1].puntaje_temporada)) {
            pos_categoria += 1
          }
        }

        for (let i = 0; i < ranks.profiles[c].ranks_seccion.length; i++) {
          let pos_seccion = 1
          for (let j = 0; j < ranks.profiles[c].ranks_seccion[i].profiles.length; j++) {
            ranks.profiles[c].ranks_seccion[i].profiles[j].posicion_temporada = pos_seccion
            ranks.profiles[c].ranks_seccion[i].profiles[j].premios_temporada = this.arreglo_premios(ranks.profiles[c].ranks_seccion[i].profiles[j].premios_temporada)
            if ((j + 1 < ranks.profiles[c].ranks_seccion[i].profiles.length) && (ranks.profiles[c].ranks_seccion[i].profiles[j].puntaje_temporada != ranks.profiles[c].ranks_seccion[i].profiles[j + 1].puntaje_temporada)) {
              pos_seccion += 1
            }
          }
        }
      }

      // Se ordenan los fotoclubes
      ranks.fotoclubs.sort((item1, item2) => {
        if (item1.puntaje_temporada < item2.puntaje_temporada) {
          return -1 * this.sentido_orden
        }
        if (item1.puntaje_temporada > item2.puntaje_temporada) {
          return 1 * this.sentido_orden
        }
        return 0
      })

      // Se asignan los numeros de posicion
      let pos_temporada = 1
      for (let c = 0; c < ranks.fotoclubs.length; c++) {
        ranks.fotoclubs[c]['posicion_temporada'] = pos_temporada
        ranks.fotoclubs[c].porc_efectividad_anual = JSON.parse(ranks.fotoclubs[c].porc_efectividad_anual)
        ranks.fotoclubs[c].premios_temporada = this.arreglo_premios(JSON.parse(ranks.fotoclubs[c].premios_temporada))

        if (c + 1 < ranks.fotoclubs.length && ranks.fotoclubs[c + 1].puntaje_temporada != ranks.fotoclubs[c].puntaje_temporada) {
          pos_temporada += 1
        }
      }

      return ranks
    },

    sumar_premios(premios1, premios2) {
      let resultado = { ...premios1 }
      let ks = Object.keys(premios2)
      for (let c = 0; c < ks.length; c++) {
        if (ks[c] != '0' && ks[c] != 'RECHAZADA') {
          resultado[ks[c]] = (resultado[ks[c]] || 0) + premios2[ks[c]]
        }
      }
      return resultado
    },

    arreglo_premios(obj) {
      let arr = []

      let ks = Object.keys(obj)
      for (let c = 0; c < ks.length; c++) {
        if (ks[c] != '0' && ks[c] != 'RECHAZADA')
          arr.push({ 'nombre': ks[c], 'cantidad': obj[ks[c]] })
      }

      arr.sort((item1, item2) => {
        if (item1.cantidad < item2.cantidad) {
          return -1 * this.sentido_orden
        }
        if (item1.cantidad > item2.cantidad) {
          return 1 * this.sentido_orden
        }
        return 0
      })

      return arr
    },

    async cargarRanking() {
      try {
        this.loading = true
        this.error = ''
        const r = await rankingService.getAll()
        this.ranking = this.procesar_ranking(r)
      } catch (e) {
        console.error('Error cargando ranking:', e)
        this.error = 'Error al cargar el ranking'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.text-capitalize {
  text-transform: capitalize !important;
}

.btn-group .btn {
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.table-responsive {
  max-height: 40rem;
  overflow-y: auto;
}
</style> 