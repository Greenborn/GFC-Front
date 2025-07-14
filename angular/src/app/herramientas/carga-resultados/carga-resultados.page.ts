import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/category.model';

function normalizarNombre(nombre: string): string {
  // Quitar acentos, pasar a minúsculas y eliminar espacios
  return nombre
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

@Component({
  selector: 'app-carga-resultados',
  templateUrl: './carga-resultados.page.html',
  styleUrls: ['./carga-resultados.page.scss']
})
export class CargaResultadosPage implements OnInit {
  estructura: string = '';
  exportacionValida: boolean = false;
  categorias: Category[] = [];
  validacionesCategorias: {dir: string, mensaje: string, color: string}[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.estructura = nav?.extras?.state?.estructura || '';
    this.categorias = nav?.extras?.state?.categorias || [];
    // Validar si existe el directorio exportacion en el primer nivel
    this.exportacionValida = this.validarDirectorioExportacion(this.estructura);
    if (this.exportacionValida) {
      this.validarCategorias(this.estructura, this.categorias);
    }
  }

  ngOnInit(): void {}

  volver() {
    this.router.navigate(['/herramientas']);
  }

  private validarDirectorioExportacion(estructura: string): boolean {
    if (!estructura) return false;
    const lineas = estructura.split('\n').map(l => l.trim());
    return lineas.some(l => l === '[DIR] exportacion/' || l === '[DIR] exportacion');
  }

  private validarCategorias(estructura: string, categorias: Category[]) {
    // Buscar directorios de segundo nivel bajo exportacion
    const lineas = estructura.split('\n').map(l => l.trim());
    // Solo directorios con exactamente un '/' después de 'exportacion/'
    const subdirs = lineas.filter(l => {
      if (!l.startsWith('[DIR] exportacion/')) return false;
      const resto = l.replace('[DIR] exportacion/', '');
      // Debe tener solo un segmento (sin más '/'), es decir, no recursivo
      return resto.length > 0 && !resto.slice(0, -1).includes('/');
    });
    this.validacionesCategorias = subdirs.map(dir => {
      // Obtener el nombre del subdirectorio
      let nombreDir = dir.replace('[DIR] exportacion/', '');
      if (nombreDir.endsWith('/')) nombreDir = nombreDir.slice(0, -1);
      // Buscar si coincide con alguna categoría (ignorando acentos y mayúsculas)
      const categoria = categorias.find(cat => normalizarNombre(cat.name) === normalizarNombre(nombreDir));
      if (categoria) {
        return { dir: nombreDir, mensaje: `Categoría reconocida: ${categoria.name}`, color: 'success' };
      } else {
        return { dir: nombreDir, mensaje: `Categoría desconocida: ${nombreDir}`, color: 'warning' };
      }
    });
  }
} 