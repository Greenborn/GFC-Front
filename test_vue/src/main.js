import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './assets/main.css'
import authService from './services/auth.js'
import sharedComponents from './components/index.js'

// Inicializar el estado de autenticación al cargar la aplicación (igual que Angular)
authService.checkAuth()

const app = createApp(App)
app.use(router)
app.use(sharedComponents)
app.mount('#app') 