import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContestService } from '../services/contest.service';
import { Contest } from '../models/contest.model';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import * as JSZip from 'jszip';
import { ModalController, LoadingController } from '@ionic/angular';
import { CargaResultadosModalComponent } from './carga-resultados-modal/carga-resultados-modal.component';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage implements OnInit {
  concursos: Contest[] = [];
  concursoSeleccionado: Contest | null = null;

  constructor(
    private router: Router,
    private contestService: ContestService,
    private http: HttpClient,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
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
    const file: File = event.target.files[0];
    if (!file) return;

    // Validar tamaño (2GB = 2 * 1024 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo supera el tamaño máximo permitido de 2 GB.');
      return;
    }

    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Solo se permiten archivos con extensión .zip');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Procesando archivo...'
    });
    await loading.present();

    // Leer y mostrar estructura del zip
    try {
      const zip = await JSZip.loadAsync(file);
      let estructura = '';
      zip.forEach((relativePath: string, zipEntry: any) => {
        estructura += (zipEntry.dir ? '[DIR] ' : '      ') + relativePath + '\n';
      });
      await loading.dismiss();
      // Navegar a la vista de carga de resultados
      this.router.navigate(['/herramientas/carga-resultados'], { state: { estructura } });
    } catch (err) {
      await loading.dismiss();
      alert('Error al leer el archivo ZIP: ' + err);
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
} 