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
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CargaResultadosModalComponent } from './carga-resultados-modal/carga-resultados-modal.component';
import { RankingService } from '../services/ranking.service';
import { ConfigService } from '../services/config/config.service';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage implements OnInit {
  concursos: Contest[] = [];
  concursoSeleccionado: Contest | null = null;
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;
  @ViewChild('folderInput', { static: false }) folderInput!: ElementRef;

  constructor(
    private router: Router,
    private contestService: ContestService,
    private categoryService: CategoryService,
    private sectionService: SectionService,
    private http: HttpClient,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private rankingService: RankingService,
    private config: ConfigService
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
    let loading = await this.loadingController.create({
      message: 'Iniciando procesamiento...',
      spinner: 'crescent'
    });
    await loading.present();
    
    const files: FileList = event.target.files;
    
    // Resetear el input inmediatamente para permitir reselección
    const inputElement = this.fileInput?.nativeElement;
    
    if (!files || files.length === 0) {
      console.log('No se seleccionaron archivos');
      await loading.dismiss();
      return;
    }
    
    try {
      console.log(`Procesando ${files.length} archivos...`);

      // Actualizar mensaje de loading
      loading.message = `Analizando estructura (${files.length} archivos)...`;
      
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
      loading.message = 'Cargando categorías y secciones...';
      let categorias: Category[] = [];
      let secciones: Section[] = [];
      
      try {
        categorias = await this.categoryService.getAll<Category>().toPromise();
        console.log(`Categorías obtenidas: ${categorias.length}`);
      } catch (err) {
        console.error('Error al obtener categorías:', err);
        throw new Error('No se pudieron cargar las categorías del sistema');
      }
      
      try {
        secciones = await this.sectionService.getAll<Section>().toPromise();
        console.log(`Secciones obtenidas: ${secciones.length}`);
      } catch (err) {
        console.error('Error al obtener secciones:', err);
        throw new Error('No se pudieron cargar las secciones del sistema');
      }

      // Validar que se haya procesado algo
      if (!estructura || estructura.trim().length === 0) {
        throw new Error('No se pudo procesar la estructura del directorio');
      }

      loading.message = 'Preparando vista de validación...';
      
      // Navegar a la vista de carga de resultados
      await this.router.navigate(['/herramientas/carga-resultados'], { 
        state: { estructura, categorias, secciones } 
      });

      // Dar un pequeño delay para que la navegación se complete antes de cerrar el loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await loading.dismiss();
      console.log('=== PROCESO COMPLETADO EXITOSAMENTE ===');
      
    } catch (error) {
      console.error('=== ERROR EN PROCESO DE CARGA ===', error);
      
      // Cerrar loading si está abierto
      if (loading) {
        await loading.dismiss();
      }

      // Mostrar alerta de error al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al procesar el directorio';
      
      const alert = await this.alertController.create({
        header: 'Error',
        message: errorMessage,
        buttons: ['OK'],
        cssClass: 'alert-danger'
      });
      await alert.present();
      
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
    const loading = await this.loadingController.create({ message: 'Recalculando ranking...' });
    await loading.present();
    try {
      await this.rankingService.recalculateRanking().toPromise();
      await loading.dismiss();
      alert('Ranking recalculado correctamente.');
    } catch (error) {
      await loading.dismiss();
      alert('Error al recalcular ranking.');
    }
  }

  async descargarCompiladoGanadoras() {
    const loading = await this.loadingController.create({ message: 'Generando compilado...' });
    await loading.present();
    try {
      const url = this.config.nodeApiBaseUrl + 'contest/compiled-winners';
      const r = await this.http.get<any>(url).toPromise();
      await loading.dismiss();
      if (r && r.success && r.download_url) {
        window.open(r.download_url, '_blank');
      } else {
        const alert = await this.alertController.create({
          header: 'Aviso',
          message: 'No se pudo obtener la URL de descarga.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (err) {
      await loading.dismiss();
      const msg = err && err.error && err.error.message ? err.error.message : 'Error al generar el compilado.';
      const alert = await this.alertController.create({
        header: 'Error',
        message: msg,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  onFolderSelected(event: any) {
    const files: FileList = event.target.files;
    
    if (!files || files.length === 0) {
      console.log('No se seleccionaron archivos');
      return;
    }

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

    // Resetear el input para permitir nueva selección
    if (this.folderInput && this.folderInput.nativeElement) {
      this.folderInput.nativeElement.value = '';
    }
  }
}
