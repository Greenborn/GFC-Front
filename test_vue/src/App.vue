<template>
  <div id="app">
    <nav-bar v-if="showNavbar" />
    <main class="container-fluid">
      <router-view />
    </main>
    <footer-component v-if="showFooter" />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import FooterComponent from './components/FooterComponent.vue'
import authService from './services/auth.js'

export default {
  name: 'App',
  components: {
    NavBar,
    FooterComponent
  },
  computed: {
    showNavbar() {
      // Ocultar navbar en páginas de login/registro
      return !['login', 'registro'].includes(this.$route.name)
    },
    showFooter() {
      // Ocultar footer en páginas de login/registro
      return !['login', 'registro'].includes(this.$route.name)
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: 20px 0;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 