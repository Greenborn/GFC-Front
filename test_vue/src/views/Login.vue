<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card mt-5">
          <div class="card-body">
            <div class="text-center mb-4">
              <img src="/GFC-logo.png" alt="GFC Logo" class="img-fluid mb-3" style="max-height: 80px;">
              <h4>Iniciar Sesión</h4>
            </div>

            <form @submit.prevent="login">
              <div class="mb-3">
                <label for="username" class="form-label">Usuario</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="credentials.username"
                  required
                  :class="{ 'is-invalid': errors.username }"
                >
                <div class="invalid-feedback" v-if="errors.username">
                  {{ errors.username }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="credentials.password"
                  required
                  :class="{ 'is-invalid': errors.password }"
                >
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>

              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>
              </div>

              <div class="alert alert-danger mt-3" v-if="errorMessage">
                {{ errorMessage }}
              </div>
            </form>

            <div class="text-center mt-3">
              <router-link to="/registro" class="text-decoration-none">
                ¿No tienes cuenta? Regístrate aquí
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/auth.js'

export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loading: false,
      errorMessage: '',
      errors: {}
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.errorMessage = ''
      this.errors = {}

      try {
        const result = await authService.login(this.credentials)
        
        if (result.success) {
          this.$router.push('/concursos')
        } else {
          this.errorMessage = result.message
        }
      } catch (error) {
        console.error('Error en login:', error)
        this.errorMessage = 'Error al conectar con el servidor'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
</style> 