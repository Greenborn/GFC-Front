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
import { ModalController, LoadingController } from '@ionic/angular';
import { CargaResultadosModalComponent } from './carga-resultados-modal/carga-resultados-modal.component';
import { RankingService } from '../services/ranking.service';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage implements OnInit {
  concursos: Contest[] = [];
  concursoSeleccionado: Contest | null = null;
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;

  constructor(
    private router: Router,
    private contestService: ContestService,
    private categoryService: CategoryService,
    private sectionService: SectionService,
    private http: HttpClient,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private rankingService: RankingService
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
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Procesando directorio...'
    });
    await loading.present();

    // Procesar estructura de directorio
    let estructura = '';
    Array.from(files).forEach(file => {
      const relativePath = (file as any).webkitRelativePath || file.name;
      const isDir = false; // No hay forma directa de saber si es directorio, pero los archivos intermedios se deducen por path
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

    // Obtener todas las categorías y secciones del sistema
    let categorias: Category[] = [];
    let secciones: Section[] = [];
    try {
      categorias = await this.categoryService.getAll<Category>().toPromise();
    } catch (err) {
      console.error('Error al obtener categorías:', err);
    }
    try {
      secciones = await this.sectionService.getAll<Section>().toPromise();
    } catch (err) {
      console.error('Error al obtener secciones:', err);
    }
    await loading.dismiss();
    // Navegar a la vista de carga de resultados
    this.router.navigate(['/herramientas/carga-resultados'], { state: { estructura, categorias, secciones } });
    
    // Resetear el input para evitar que se quede "trabado"
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  descargarListado() {
    if (!this.concursoSeleccionado) return;
    const id = this.concursoSeleccionado.id;
    const url = `https://gfc.api2.greenborn.com.ar/api/contests/participants?id=${id}`;
    this.http.get<any>(url).subscribe(response => {
      if (response && response.participants) {
        const data = response.participants.map(p => ({
          Nombre: p.name,
          Apellido: p.last_name,
          DNI: p.dni,
          Categoria: p.category_name
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        // Ajustar el ancho de las columnas
        ws['!cols'] = [
          { wch: 20 }, // Nombre
          { wch: 20 }, // Apellido
          { wch: 15 }, // DNI
          { wch: 20 }  // Categoria
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
} 