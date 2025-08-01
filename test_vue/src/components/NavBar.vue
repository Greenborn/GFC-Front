<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <img src="/GFC-logo.png" alt="GFC Logo" height="30" class="d-inline-block align-text-top me-2">
        GFC
      </router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto" v-if="user">
          <li class="nav-item">
            <router-link class="nav-link" to="/ranking">Ranking</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/concursos">Concursos</router-link>
          </li>
          <li class="nav-item" v-if="isDelegadoOrAdmin">
            <router-link class="nav-link" to="/usuarios">{{ getNombreUsuarios }}</router-link>
          </li>
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" to="/organizaciones">Organizaciones</router-link>
          </li>
        </ul>
        
        <ul class="navbar-nav" v-if="user">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
              <img :src="user.avatar || '/default-avatar.png'" alt="Avatar" class="rounded-circle me-1" width="24" height="24">
              {{ user.first_name }} {{ user.last_name }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link class="dropdown-item" :to="`/perfil/${user.id}`">
                  <i class="bi bi-person"></i> Mi Perfil
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/perfil/editar">
                  <i class="bi bi-gear"></i> Configuración
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
        </ul>
        
        <ul class="navbar-nav" v-else>
          <li class="nav-item">
            <router-link class="nav-link" to="/login">Iniciar Sesión</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/registro">Registrarse</router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import authService from '../services/auth.js'
import rolificadorService from '../services/rolificador.js'

export default {
  name: 'NavBar',
  data() {
    return {
      user: null,
      authInterval: null
    }
  },
  computed: {
    isAdmin() {
      return rolificadorService.isAdmin(this.user)
    },
    isDelegadoOrAdmin() {
      return rolificadorService.esDelegado(this.user) || rolificadorService.isAdmin(this.user)
    },
    getNombreUsuarios() {
      return rolificadorService.getNombreUsuarios(this.user?.role_id)
    }
  },
  async mounted() {
    await this.loadUser()
    // Verificar autenticación periódicamente (similar a Angular)
    this.authInterval = setInterval(async () => {
      if (authService.isLoggedIn() && !this.user) {
        await this.loadUser()
      } else if (!authService.isLoggedIn() && this.user) {
        this.user = null
      }
    }, 1000)
  },
  beforeUnmount() {
    if (this.authInterval) {
      clearInterval(this.authInterval)
    }
  },
  methods: {
    async loadUser() {
      this.user = await authService.getUser()
    },
    async logout() {
      await authService.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.navbar-brand img {
  filter: brightness(0) invert(1);
}

.dropdown-item i {
  margin-right: 0.5rem;
}
</style> 