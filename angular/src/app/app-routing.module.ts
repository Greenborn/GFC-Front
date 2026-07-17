import { PreloadAllModules, Routes } from '@angular/router';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { PoliticaPrivacidadComponent } from './politica-privacidad/politica-privacidad.component';
import { CondicionesServicioComponent } from './condiciones-servicio/condiciones-servicio.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'concursos',
  //   pathMatch: 'full'
  // },
  {
    path: 'folder/:id',
    loadComponent: () => import('./folder/folder.page').then( m => m.FolderPage)
  },
  {
    path: 'concursos',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./concursos/concursos.page').then(m => m.ConcursosPage)
      },
      {
        path: 'secciones',
        loadChildren: () => import('./concursos/secciones-abm/secciones-abm.module').then( m => m.SeccionesAbmPageModule)
      },
      {
        path: 'ranking',
        loadComponent: () => import('./concursos/ranking/ranking.page').then(m => m.RankingPage)
      },
      {
        path: 'metricas',
        loadChildren: () => import('./concursos/metricas-abm/metricas-abm.module').then( m => m.MetricasAbmPageModule)
      },
      {
        path: 'nuevo',
        canActivate: [AuthGuard],
        loadComponent: () => import('./concursos/concurso-post/concurso-post.page').then( m => m.ConcursoPostPage)
      },
      {
        path: 'editar/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('./concursos/concurso-post/concurso-post.page').then( m => m.ConcursoPostPage)
      },
      {
        path: ':id',
        loadComponent: () => import('./concursos/concurso-detail/concurso-detail.page').then( m => m.ConcursoDetailPage),
        children: [
          {
            path: 'concursantes',
            loadComponent: () => import('./concursos/concurso-detail/concursantes/concursantes.component').then(m => m.ConcursantesComponent)
          },
          {
            path: 'fotografias',
            loadComponent: () => import('./concursos/concurso-detail/fotografias/fotografias.component').then(m => m.FotografiasComponent)
          },
          {
            path: 'juzgamiento',
            loadComponent: () => import('./concursos/concurso-detail/juzgamiento/juzgamiento.component').then(m => m.JuzgamientoComponent)
          },
          {
            path: 'informacion',
            loadComponent: () => import('./concursos/concurso-detail/informacion/informacion.component').then(m => m.InformacionComponent)
          },
          {
            path: '',
            redirectTo: 'informacion',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },
  {
    path: 'perfil',
    canActivate: [AuthGuard],
    children: [
      {
        path: ':id',
        loadComponent: () => import('./usuario/perfil/perfil.page').then( m => m.PerfilPage)
      },
      {
        path: 'editar',
        loadComponent: () => import('./usuario/usuario.page').then( m => m.UsuarioPage)
      }
    ]
    // loadChildren: () => import('./usuario/usuario.module').then( m => m.UsuarioPageModule)
  },
  {
    path: 'usuarios',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./usuario/usuarios-abm/usuarios-abm.page').then( m => m.UsuariosAbmPage)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./usuario/usuarios-abm/usuario-post/usuario-post.page').then( m => m.UsuarioPostPage)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./usuario/usuarios-abm/usuario-post/usuario-post.page').then( m => m.UsuarioPostPage)
      }
  ]
},
{
  path: 'notificaciones',
  canActivate: [AuthGuard],
  loadComponent: () => import('./notificaciones/notificaciones.page').then( m => m.NotificacionesPage)
},
  {
    path: 'organizaciones',
    loadComponent: () => import('./fotoclubs-abm/fotoclubs-abm.page').then( m => m.FotoclubsAbmPage)
  },
  {
    path: 'herramientas',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./herramientas/herramientas.page').then(m => m.HerramientasPage)
      },
      {
        path: 'busqueda-fotografias',
        loadChildren: () => import('./herramientas/busqueda-fotografias/busqueda-fotografias.module').then(m => m.BusquedaFotografiasModule)
      },
      {
        path: 'carga-resultados',
        loadComponent: () => import('./herramientas/carga-resultados/carga-resultados.page').then(m => m.CargaResultadosPage)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./info-centro/info-centro.page').then( m => m.InfoCentroPage),
    pathMatch: 'full'
  },
  {
    path: 'registro',
    loadComponent: () => import('./usuario/usuarios-abm/usuario-post/usuario-post.page').then( m => m.UsuarioPostPage),
    pathMatch: 'full'
  },
  {
    path: 'politica-privacidad',
    component: PoliticaPrivacidadComponent
  },
  {
    path: 'condiciones-servicio',
    component: CondicionesServicioComponent
  },
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/components/login-view/login-view.component').then(m => m.LoginViewComponent)
  },
  {
    path: 'login-redirect',
    loadComponent: () => import('./modules/auth/components/login-redirect/login-redirect.component').then(m => m.LoginRedirectComponent)
  },
  {
    path: 'recuperar-password',
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/auth/components/recuperar-password/recuperar-password-solicitud.component').then(m => m.RecuperarPasswordSolicitudComponent)
      },
      {
        path: 'codigo',
        loadComponent: () => import('./modules/auth/components/recuperar-password/recuperar-password-codigo.component').then(m => m.RecuperarPasswordCodigoComponent)
      },
      {
        path: 'exito',
        loadComponent: () => import('./modules/auth/components/recuperar-password/recuperar-password-exito.component').then(m => m.RecuperarPasswordExitoComponent)
      }
    ]
  }
];
