// Registro de componentes compartidos
import UsuarioImg from './UsuarioImg.vue'

export default {
  install(app) {
    // Registrar componentes globalmente
    app.component('UsuarioImg', UsuarioImg)
  }
} 