<template>
  <footer class="bg-dark text-light py-4 mt-auto">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <h5>GFC - Grupo Fotográfico</h5>
          <p class="mb-0">Plataforma de gestión de concursos fotográficos</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="mb-0">Versión {{ version }}</p>
          <p class="mb-0">&copy; 2024 GFC. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import configService from '../services/config.js'

export default {
  name: 'FooterComponent',
  data() {
    return {
      version: configService.data.version
    }
  }
}
</script>

<style scoped>
footer {
  margin-top: auto;
}
</style> 