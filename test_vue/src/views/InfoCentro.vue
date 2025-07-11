<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <div class="text-center mb-5">
          <img src="/GFC-logo.png" alt="GFC Logo" class="img-fluid mb-4" style="max-height: 200px;">
          <h1 class="display-4">Grupo Fotográfico</h1>
          <p class="lead">Plataforma de gestión de concursos fotográficos</p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Bienvenido al GFC</h5>
            <p class="card-text">
              El Grupo Fotográfico es una plataforma que permite gestionar concursos fotográficos,
              administrar usuarios, organizaciones y resultados de manera eficiente y organizada.
            </p>
            
            <div class="row mt-4">
              <div class="col-md-6">
                <h6>Características principales:</h6>
                <ul class="list-unstyled">
                  <li><i class="bi bi-check-circle text-success me-2"></i>Gestión de concursos</li>
                  <li><i class="bi bi-check-circle text-success me-2"></i>Administración de usuarios</li>
                  <li><i class="bi bi-check-circle text-success me-2"></i>Organizaciones fotográficas</li>
                  <li><i class="bi bi-check-circle text-success me-2"></i>Resultados y rankings</li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6>Funcionalidades:</h6>
                <ul class="list-unstyled">
                  <li><i class="bi bi-check-circle text-success me-2"></i>Subida de fotografías</li>
                  <li><i class="bi bi-check-circle text-success me-2"></i>Sistema de notificaciones</li>
                  <li><i class="bi bi-check-circle text-success me-2"></i>Perfiles de usuario</li>
                  <li><i class="bi bi-check-circle text-success me-2"></i>Reportes y estadísticas</li>
                </ul>
              </div>
            </div>

            <div class="text-center mt-4">
              <router-link to="/login" class="btn btn-primary btn-lg me-3">
                <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
              </router-link>
              <router-link to="/registro" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-person-plus me-2"></i>Registrarse
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfoCentro'
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.display-4 {
  color: var(--primary-color);
  font-weight: 600;
}

.lead {
  color: var(--secondary-color);
}
</style> 