<template>
  <div class="usuario-img">
    <img 
      v-if="imageSrc" 
      :src="imageSrc" 
      :alt="alt"
      :class="imgClass"
      @error="handleImageError"
    >
    <div 
      v-else 
      :class="['default-avatar', imgClass]"
    >
      <i class="fa fa-user"></i>
    </div>
  </div>
</template>

<script>
import configService from '../services/config.js'

export default {
  name: 'UsuarioImg',
  props: {
    src: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: 'Usuario'
    },
    size: {
      type: String,
      default: 'md' // sm, md, lg, xl
    },
    rounded: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    imageSrc() {
      if (!this.src) return ''
      
      // Si ya es una URL completa, usarla tal cual
      if (this.src.startsWith('http://') || this.src.startsWith('https://')) {
        return this.src
      }
      
      // Si es una ruta relativa, concatenar con la base de la API
      return configService.data.apiBaseUrl + this.src
    },
    imgClass() {
      const classes = [`img-${this.size}`]
      if (this.rounded) {
        classes.push('rounded-circle')
      }
      return classes.join(' ')
    }
  },
  methods: {
    handleImageError(event) {
      // Ocultar imagen si hay error al cargarla
      event.target.style.display = 'none'
      // Mostrar el div con el ícono por defecto
      const defaultAvatar = event.target.nextElementSibling
      if (defaultAvatar) {
        defaultAvatar.style.display = 'flex'
      }
    }
  }
}
</script>

<style scoped>
.usuario-img {
  position: relative;
  display: inline-block;
}

.usuario-img img {
  object-fit: cover;
  border: 1px solid #ddd;
}

.default-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  color: #6c757d;
}

.default-avatar i {
  font-size: 0.8em;
}

/* Tamaños */
.img-sm {
  width: 32px;
  height: 32px;
}

.img-md {
  width: 48px;
  height: 48px;
}

.img-lg {
  width: 64px;
  height: 64px;
}

.img-xl {
  width: 96px;
  height: 96px;
}

.rounded-circle {
  border-radius: 50%;
}

.default-avatar.img-sm {
  font-size: 12px;
}

.default-avatar.img-md {
  font-size: 16px;
}

.default-avatar.img-lg {
  font-size: 20px;
}

.default-avatar.img-xl {
  font-size: 32px;
}
</style> 