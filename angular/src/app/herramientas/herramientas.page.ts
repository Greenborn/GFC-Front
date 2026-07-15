import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ContestService } from '../services/contest.service';
import { Contest } from '../models/contest.model';
import { Category } from '../models/category.model';
import { CategoryService } from '../services/category.service';
import { Section } from '../models/section.model';
import { SectionService } from '../services/section.service';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { CargaResultadosModalComponent } from './carga-resultados-modal/carga-resultados-modal.component';
import { LoadingService } from '../services/ui/loading.service';
import { AlertService } from '../services/ui/alert.service';
import { UiUtilsService } from '../services/ui/ui-utils.service';
import { RankingService } from '../services/ranking.service';
import { ConfigService } from '../services/config/config.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage implements OnInit {
  concursos: Contest[] = [];
  concursoSeleccionado: Contest | null = null;
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;
  @ViewChild('folderInput', { static: false }) folderInput!: ElementRef;
  
  // Variables para el modal de Agregar Grabación
  isModalGrabacionOpen = false;
  anioActual = new Date().getFullYear();
  anioAnterior = this.anioActual - 1;
  urlInvalida = false;
  grabacionData = {
    temporada: new Date().getFullYear(),
    url: ''
  };

  constructor(
    private router: Router,
    private contestService: ContestService,
    private categoryService: CategoryService,
    private sectionService: SectionService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private rankingService: RankingService,
    private config: ConfigService,
    private UIUtilsService: UiUtilsService
  ) {}

  ngOnInit() {
    // Resetear el input de archivo
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
    
    this.contestService.getAll<Contest>('per-page=1000').subscribe(data => {
      this.concursos = data.sort((a, b) => {
        const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return dateB - dateA;
      });
    });
  }

  abrirBusquedaFotografias() {
    this.router.navigate(['/herramientas/busqueda-fotografias']);
  }

  cargarResultados() {
    console.log('Clic en Cargar Resultados');
    // Aquí se implementará la lógica para cargar resultados de juzgamiento
  }

  async onFileSelected(event: any) {
    console.log('=== DEBUG INICIO CARGA DIRECTORIO ===');
    
    // Mostrar loading INMEDIATAMENTE al detectar el evento
    await this.loadingService.present('Iniciando procesamiento...');
    
    const files: FileList = event.target.files;
    
    // Resetear el input inmediatamente para permitir reselección
    const inputElement = this.fileInput?.nativeElement;
    
    if (!files || files.length === 0) {
      console.log('No se seleccionaron archivos');
      this.loadingService.dismiss();
      return;
    }
    
    try {
      console.log(`Procesando ${files.length} archivos...`);

      // Actualizar mensaje de loading
      this.loadingService.present(`Analizando estructura (${files.length} archivos)...`);
      
      // Procesar estructura de directorio
      let estructura = '';
      Array.from(files).forEach(file => {
        const relativePath = (file as any).webkitRelativePath || file.name;
        estructura += '      ' + relativePath + '\n';
      });

      // Agregar directorios explícitamente
      const directorios = new Set<string>();
      Array.from(files).forEach(file => {
        const relativePath = (file as any).webkitRelativePath || file.name;
        const partes = relativePath.split('/');
        for (let i = 1; i < partes.length; i++) {
          const dir = partes.slice(0, i).join('/');
          directorios.add(dir);
        }
      });
      directorios.forEach(dir => {
        estructura = '[DIR] ' + dir + '\n' + estructura;
      });

      console.log(`Directorios detectados: ${directorios.size}`);

      // Obtener todas las categorías y secciones del sistema
      this.loadingService.present('Cargando categorías y secciones...');
      let categorias: Category[] = [];
      let secciones: Section[] = [];
      
      try {
        categorias = await firstValueFrom(this.categoryService.getAll<Category>());
        console.log(`Categorías obtenidas: ${categorias.length}`);
      } catch (err) {
        console.error('Error al obtener categorías:', err);
        throw new Error('No se pudieron cargar las categorías del sistema');
      }
      
      try {
        secciones = await firstValueFrom(this.sectionService.getAll<Section>());
        console.log(`Secciones obtenidas: ${secciones.length}`);
      } catch (err) {
        console.error('Error al obtener secciones:', err);
        throw new Error('No se pudieron cargar las secciones del sistema');
      }

      // Validar que se haya procesado algo
      if (!estructura || estructura.trim().length === 0) {
        throw new Error('No se pudo procesar la estructura del directorio');
      }

      this.loadingService.present('Preparando vista de validación...');
      
      // Navegar a la vista de carga de resultados
      await this.router.navigate(['/herramientas/carga-resultados'], { 
        state: { estructura, categorias, secciones } 
      });

      // Dar un pequeño delay para que la navegación se complete antes de cerrar el loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.loadingService.dismiss();
      console.log('=== PROCESO COMPLETADO EXITOSAMENTE ===');
      
    } catch (error) {
      console.error('=== ERROR EN PROCESO DE CARGA ===', error);
      
      // Cerrar loading si está abierto
      this.loadingService.dismiss();

      // Mostrar alerta de error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el directorio';
      
      await this.UIUtilsService.mostrarAlert({
        header: 'Error',
        message: errorMessage
      })
      
    } finally {
      // Resetear el input para permitir nueva selección
      if (inputElement) {
        inputElement.value = '';
      }
    }
  }

  descargarListado() {
    if (!this.concursoSeleccionado) return;
    const id = this.concursoSeleccionado.id;
  const url = `${this.config.nodeApiBaseUrl}contests/participants?id=${id}`;
    const token = localStorage.getItem(this.config.tokenKey);
    const headers = token ? { Authorization: 'Bearer ' + token } : {};
    this.http.get<any>(url, { headers }).subscribe(response => {
      if (response && response.participants) {
        const data = response.participants.map(p => ({
          Nombre: p.name,
          Apellido: p.last_name,
          DNI: p.dni,
          Email: p.email,
          Categoria: p.category_name,
          "Fotoclub/Organización/Insitución": p.fotoclub_name
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        // Ajustar el ancho de las columnas
        ws['!cols'] = [
          { wch: 20 }, // Nombre
          { wch: 20 }, // Apellido
          { wch: 15 }, // DNI
          { wch: 20 }, // Email
          { wch: 20 }, // Categoria
          { wch: 30 }  // Fotoclub/Organización/Insitución
        ];
        // NOTA: XLSX no soporta estilos de encabezado (color fondo/texto) en navegadores
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Participantes');
        XLSX.writeFile(wb, `participantes_concurso_${id}.xlsx`);
      }
    });
  }

  async recalcularRanking() {
    await this.loadingService.present('Recalculando ranking...');
    try {
      await firstValueFrom(this.rankingService.recalculateRanking());
      this.loadingService.dismiss();
      alert('Ranking recalculado correctamente.');
    } catch (error) {
      this.loadingService.dismiss();
      alert('Error al recalcular ranking.');
    }
  }

  async descargarCompiladoGanadoras() {
    await this.loadingService.present('Generando compilado...');
    try {
      const url = this.config.nodeApiBaseUrl + 'contest/compiled-winners';
      const r = await firstValueFrom(this.http.get<any>(url));
      this.loadingService.dismiss();
      if (r && r.success && r.download_url) {
        window.open(r.download_url, '_blank');
      } else {
        await this.UIUtilsService.mostrarAlert({
          header: 'Aviso',
          message: 'No se pudo obtener la URL de descarga.'
        })
      }
    } catch (err) {
      this.loadingService.dismiss();
      const msg = err && (err as any).error && (err as any).error.message ? (err as any).error.message : 'Error al generar el compilado.';
      await this.UIUtilsService.mostrarAlert({
        header: 'Error',
        message: msg
      })
    }
  }

  async onFolderSelected(event: any) {
    const files: FileList = event.target.files;
    
    if (!files || files.length === 0) {
      console.log('No se seleccionaron archivos');
      return;
    }

    // Mostrar loading
    await this.loadingService.present('Procesando directorio de fotos del año...');

    try {
      // Construir estructura de directorios y archivos
      const estructura: any = {
        raiz: '',
        directorios: {},
        archivos: []
      };

      // Obtener el nombre del directorio raíz
      const primerArchivo = files[0] as any;
      const rutaCompleta = primerArchivo.webkitRelativePath || primerArchivo.name;
      estructura.raiz = rutaCompleta.split('/')[0];

      // Procesar todos los archivos
      Array.from(files).forEach(file => {
        const relativePath = (file as any).webkitRelativePath || file.name;
        const partes = relativePath.split('/');
        
        // Eliminar el directorio raíz del path
        const pathSinRaiz = partes.slice(1);
        
        if (pathSinRaiz.length === 1) {
          // Archivo en la raíz
          estructura.archivos.push(file.name);
        } else {
          // Archivo en subdirectorio
          let dirActual = estructura.directorios;
          
          // Navegar/crear la estructura de directorios
          for (let i = 0; i < pathSinRaiz.length - 1; i++) {
            const nombreDir = pathSinRaiz[i];
            if (!dirActual[nombreDir]) {
              dirActual[nombreDir] = {
                archivos: [],
                subdirectorios: {}
              };
            }
            dirActual = dirActual[nombreDir].subdirectorios;
          }
          
          // Agregar el archivo al directorio correspondiente
          const nombreArchivo = pathSinRaiz[pathSinRaiz.length - 1];
          const dirPadre = pathSinRaiz.slice(0, -1);
          let dirDestino = estructura.directorios;
          
          for (const d of dirPadre) {
            dirDestino = dirDestino[d].subdirectorios;
          }
          
          const ultimoDir = dirPadre[dirPadre.length - 1];
          if (ultimoDir) {
            let temp = estructura.directorios;
            for (let i = 0; i < dirPadre.length - 1; i++) {
              temp = temp[dirPadre[i]].subdirectorios;
            }
            temp[ultimoDir].archivos.push(nombreArchivo);
          }
        }
      });

      // Mostrar en consola
      console.log('=== ESTRUCTURA DE DIRECTORIOS Y ARCHIVOS ===');
      console.log(JSON.stringify(estructura, null, 2));

      // Enviar al endpoint
      this.loadingService.present('Enviando datos al servidor...');
      const url = `${this.config.nodeApiBaseUrl}foto-del-anio`;
      const token = localStorage.getItem(this.config.tokenKey);
      const headers = token ? { Authorization: 'Bearer ' + token } : {};

      const response = await firstValueFrom(this.http.post<any>(url, estructura, { headers }));
      
      this.loadingService.dismiss();

      // Mostrar resultado exitoso
      await this.UIUtilsService.mostrarAlert({
        header: 'Éxito',
        message: 'La estructura de fotos del año se envió correctamente al servidor.'
      })

      console.log('Respuesta del servidor:', response);

    } catch (error) {
      this.loadingService.dismiss();
      
      console.error('Error al procesar/enviar fotos del año:', error);
      
      const errorMessage = error && (error as any).error && (error as any).error.message 
        ? (error as any).error.message 
        : 'Error al procesar o enviar la estructura de fotos del año.';
      
      await this.UIUtilsService.mostrarAlert({
        header: 'Error',
        message: errorMessage
      })
      
    } finally {
      // Resetear el input para permitir nueva selección
      if (this.folderInput && this.folderInput.nativeElement) {
        this.folderInput.nativeElement.value = '';
      }
    }
  }

  // Métodos para el modal de Agregar Grabación
  abrirModalAgregarGrabacion() {
    this.isModalGrabacionOpen = true;
    this.grabacionData = {
      temporada: this.anioActual,
      url: ''
    };
    this.urlInvalida = false;
  }

  cerrarModalGrabacion() {
    this.isModalGrabacionOpen = false;
    this.grabacionData = {
      temporada: this.anioActual,
      url: ''
    };
    this.urlInvalida = false;
  }

  validarUrl() {
    const url = this.grabacionData.url.trim();
    
    if (url.length === 0) {
      this.urlInvalida = false;
      return;
    }
    
    try {
      const urlObj = new URL(url);
      this.urlInvalida = !(urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
    } catch (e) {
      this.urlInvalida = true;
    }
  }

  async agregarGrabacion() {
    if (this.urlInvalida || !this.grabacionData.url) {
      return;
    }

    await this.loadingService.present('Agregando grabación...');

    try {
      const url = `${this.config.nodeApiBaseUrl}contest-record`;
      const token = localStorage.getItem(this.config.tokenKey);
      const headers = token ? { 
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      };

      const body = {
        contest_id: 51, // Según el ejemplo del curl
        url: this.grabacionData.url,
        object: "Foto del Año",
        temporada: this.grabacionData.temporada,
        type: "FOTO_DEL_ANIO"
      };

      const response = await firstValueFrom(this.http.post<any>(url, body, { headers }));
      
      this.loadingService.dismiss();

      await this.UIUtilsService.mostrarAlert({
        header: 'Éxito',
        message: 'La grabación se agregó correctamente.'
      })

      this.cerrarModalGrabacion();

    } catch (error) {
      this.loadingService.dismiss();
      
      console.error('Error al agregar grabación:', error);
      
      const errorMessage = error && (error as any).error && (error as any).error.message 
        ? (error as any).error.message 
        : 'Error al agregar la grabación.';
      
      await this.UIUtilsService.mostrarAlert({
        header: 'Error',
        message: errorMessage
      })
    }
  }
}
