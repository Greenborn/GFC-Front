import { createRouter, createWebHashHistory } from 'vue-router'
import authService from '../services/auth.js'

// Importar vistas
import InfoCentro from '../views/InfoCentro.vue'
import Login from '../views/Login.vue'
import Concursos from '../views/concursos/Concursos.vue'
import ConcursoDetail from '../views/concursos/ConcursoDetail.vue'
import ConcursoPost from '../views/concursos/ConcursoPost.vue'
import Usuarios from '../views/usuario/Usuarios.vue'
import UsuarioPost from '../views/usuario/UsuarioPost.vue'
import Perfil from '../views/usuario/Perfil.vue'
import UsuarioEdit from '../views/usuario/UsuarioEdit.vue'
import Notificaciones from '../views/Notificaciones.vue'
import Fotoclubs from '../views/fotoclubs/Fotoclubs.vue'
import FotoclubPost from '../views/fotoclubs/FotoclubPost.vue'
import Ranking from '../views/concursos/Ranking.vue'
import Folder from '../views/Folder.vue'

// Guard de autenticación (igual que Angular)
const requireAuth = (to, from, next) => {
  console.log('Guard requireAuth: Verificando autenticación para', to.path)
  
  if (authService.loggedIn) {
    console.log('Guard requireAuth: Usuario autenticado, permitiendo acceso')
    next()
  } else {
    console.log('Guard requireAuth: No autenticado, redirigiendo a /login')
    next('/login')
  }
}

// Guard para redirigir usuarios autenticados desde login/registro
const redirectIfAuthenticated = (to, from, next) => {
  console.log('Guard redirectIfAuthenticated: Verificando para', to.path)
  
  // Permitir siempre el acceso a login/registro, la redirección se manejará en el componente
  console.log('Guard redirectIfAuthenticated: Permitiendo acceso a', to.path)
  next()
}

const routes = [
  {
    path: '/',
    name: 'info-centro',
    component: InfoCentro
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: redirectIfAuthenticated
  },
  {
    path: '/registro',
    name: 'registro',
    component: UsuarioPost,
    beforeEnter: redirectIfAuthenticated
  },
  {
    path: '/concursos',
    name: 'concursos',
    component: Concursos,
    beforeEnter: requireAuth
  },
  {
    path: '/concursos/nuevo',
    name: 'concurso-nuevo',
    component: ConcursoPost,
    beforeEnter: requireAuth
  },
  {
    path: '/concursos/editar/:id',
    name: 'concurso-editar',
    component: ConcursoPost,
    beforeEnter: requireAuth
  },
  {
    path: '/concursos/:id',
    name: 'concurso-detail',
    component: ConcursoDetail,
    beforeEnter: requireAuth
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: Usuarios,
    beforeEnter: requireAuth
  },
  {
    path: '/usuarios/nuevo',
    name: 'usuario-nuevo',
    component: UsuarioPost,
    beforeEnter: requireAuth
  },
  {
    path: '/usuarios/editar/:id',
    name: 'usuario-editar',
    component: UsuarioPost,
    beforeEnter: requireAuth
  },
  {
    path: '/perfil/:id',
    name: 'perfil',
    component: Perfil,
    beforeEnter: requireAuth
  },
  {
    path: '/perfil/editar',
    name: 'perfil-editar',
    component: UsuarioEdit,
    beforeEnter: requireAuth
  },
  {
    path: '/notificaciones',
    name: 'notificaciones',
    component: Notificaciones,
    beforeEnter: requireAuth
  },
  {
    path: '/organizaciones',
    name: 'organizaciones',
    component: Fotoclubs
  },
  {
    path: '/organizaciones/nuevo',
    name: 'organizacion-nuevo',
    component: FotoclubPost
  },
  {
    path: '/organizaciones/editar/:id',
    name: 'organizacion-editar',
    component: FotoclubPost
  },
  {
    path: '/ranking',
    name: 'ranking',
    component: Ranking,
    beforeEnter: requireAuth
  },
  {
    path: '/folder/:id',
    name: 'folder',
    component: Folder,
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Guard global para manejar la autenticación
router.beforeEach((to, from, next) => {
  // No verificar autenticación en rutas públicas
  if (['/', '/login', '/registro'].includes(to.path)) {
    next()
    return
  }
  
  // Forzar la verificación de autenticación en cada navegación
  authService.checkAuth()
  next()
})

export default router 