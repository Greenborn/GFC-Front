// Servicio para manejar roles de acceso (basado en Angular)
import userService from './user.js'
import profileService from './profile.js'
import fotoclubService from './fotoclub.js'

class RolificadorService {
  constructor() {
    this.user = null
  }

  // Verificar si el usuario es administrador
  isAdmin(user) {
    return user && user.role_id === 1
  }

  // Verificar si el usuario es delegado
  esDelegado(user) {
    return user && user.role_id === 2
  }

  // Obtener nombre de usuarios según el rol
  getNombreUsuarios(roleId) {
    return roleId == 1 ? 'Usuarios' : 'Autores'
  }

  // Obtener tipo de rol
  getRoleType(roleId) {
    const roles = {
      1: 'Administrador',
      2: 'Delegado',
      3: 'Usuario'
    }
    return roles[roleId] || 'Sin rol'
  }

  // Obtener miembros según el rol del usuario logueado
  async getMiembros(userLogged) {
    if (!userLogged) return []

    try {
      if (this.isAdmin(userLogged)) {
        // Admin ve todos los perfiles expandidos (igual que Angular)
        return await profileService.getAll('expand=user,fotoclub')
      } else {
        // Delegado ve solo perfiles de su fotoclub
        if (!userLogged.profile_id) {
          console.warn('Usuario sin profile_id:', userLogged)
          return []
        }
        const userProfile = await profileService.get(userLogged.profile_id)
        if (userProfile && userProfile.fotoclub_id) {
          return await profileService.getAll(`filter[fotoclub_id]=${userProfile.fotoclub_id}&expand=user,fotoclub`)
        }
        return []
      }
    } catch (error) {
      console.error('Error obteniendo miembros:', error)
      return []
    }
  }

  // Obtener usuarios según el rol del usuario logueado
  async getUsers(userLogged) {
    if (!userLogged) return []

    try {
      if (this.isAdmin(userLogged)) {
        // Admin ve todos los usuarios
        return await userService.getAll()
      } else {
        // Delegado ve solo usuarios de su fotoclub
        if (!userLogged.profile_id) {
          console.warn('Usuario sin profile_id:', userLogged)
          return []
        }
        const userProfile = await profileService.get(userLogged.profile_id)
        if (userProfile && userProfile.fotoclub_id) {
          return await userService.getByFotoclub(userProfile.fotoclub_id)
        }
        return []
      }
    } catch (error) {
      console.error('Error obteniendo usuarios:', error)
      return []
    }
  }

  // Obtener perfiles según el rol del usuario logueado
  async getProfiles(userLogged) {
    if (!userLogged) return []

    try {
      if (this.isAdmin(userLogged)) {
        // Admin ve todos los perfiles
        return await profileService.getAll('expand=user,fotoclub')
      } else {
        // Delegado ve solo perfiles de su fotoclub
        if (!userLogged.profile_id) {
          console.warn('Usuario sin profile_id:', userLogged)
          return []
        }
        const userProfile = await profileService.get(userLogged.profile_id)
        if (userProfile && userProfile.fotoclub_id) {
          return await profileService.getAll(`filter[fotoclub_id]=${userProfile.fotoclub_id}&expand=user,fotoclub`)
        }
        return []
      }
    } catch (error) {
      console.error('Error obteniendo perfiles:', error)
      return []
    }
  }

  // Verificar permisos para crear usuarios
  canCreateUser(userLogged) {
    return this.esDelegado(userLogged) || this.isAdmin(userLogged)
  }

  // Verificar permisos para editar usuarios
  canEditUser(userLogged, targetUser) {
    if (this.isAdmin(userLogged)) return true
    
    if (this.esDelegado(userLogged)) {
      // Delegado puede editar usuarios de su fotoclub
      return targetUser.profile && targetUser.profile.fotoclub_id === userLogged.profile?.fotoclub_id
    }
    
    return false
  }

  // Verificar permisos para eliminar usuarios
  canDeleteUser(userLogged, targetUser) {
    if (this.isAdmin(userLogged)) return true
    
    if (this.esDelegado(userLogged)) {
      // Delegado puede eliminar usuarios de su fotoclub (excepto otros delegados)
      return targetUser.profile && 
             targetUser.profile.fotoclub_id === userLogged.profile?.fotoclub_id &&
             targetUser.role_id !== 2
    }
    
    return false
  }
}

export default new RolificadorService() 