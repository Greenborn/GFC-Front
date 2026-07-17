import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/category.model';
import { Section } from '../../models/section.model';
import { ContestResultService } from '../../services/contest-result.service';
import axios from 'axios';
import { ConfigService } from '../../services/config/config.service';
import { LoadingService } from '../../services/ui/loading.service';
import { CommonModule } from '@angular/common';

function normalizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-carga-resultados',
  templateUrl: './carga-resultados.page.html',
  styleUrls: ['./carga-resultados.page.scss']
})
export class CargaResultadosPage implements OnInit {
  estructura: string = '';
  directorioBaseValido: boolean = false;
  directorioBase: string = '';
  categorias: Category[] = [];
  secciones: Section[] = [];
  validacionesCategorias: {dir: string, mensaje: string, color: string}[] = [];
  validacionesSecciones: {dir: string, mensaje: string, color: string}[] = [];
  validacionesPremios: {dir: string, mensaje: string, color: string}[] = [];
  fotografiasSinCatalogar: string[] = [];
  validacionesFotografias: {dir: string, mensaje: string, color: string}[] = [];

  constructor(
    private router: Router,
    private contestResultService: ContestResultService,
    private config: ConfigService,
    private loadingService: LoadingService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.estructura = nav?.extras?.state?.estructura || '';
    this.categorias = nav?.extras?.state?.categorias || [];
    this.secciones = nav?.extras?.state?.secciones || [];
    
    this.directorioBase = this.detectarDirectorioBase(this.estructura);
    this.directorioBaseValido = this.directorioBase.length > 0;
    
    if (this.directorioBaseValido) {
      this.validarCategorias(this.estructura, this.categorias);
      this.validarSecciones(this.estructura, this.secciones);
      this.validarCuartoNivel(this.estructura);
      this.validarQuintoNivel(this.estructura);
    }
  }

  ngOnInit(): void {}

  volver() {
    this.router.navigate(['/herramientas']);
  }

  obtenerNombreArchivo(ruta: string): string {
    const partes = ruta.split('/');
    return partes[partes.length - 1];
  }

  private detectarDirectorioBase(estructura: string): string {
    if (!estructura) return '';
    const lineas = estructura.split('\n').map(l => l.trim());
    
    const primerDir = lineas.find(l => {
      if (!l.startsWith('[DIR] ')) return false;
      const path = l.replace('[DIR] ', '').replace(/\/$/, '');
      return !path.includes('/');
    });
    
    if (primerDir) {
      return primerDir.replace('[DIR] ', '').replace(/\/$/, '');
    }
    
    return '';
  }

  private validarCategorias(estructura: string, categorias: Category[]) {
    const lineas = estructura.split('\n').map(l => l.trim());
    const prefijoBusqueda = `[DIR] ${this.directorioBase}/`;
    
    const subdirs = lineas.filter(l => {
      if (!l.startsWith(prefijoBusqueda)) return false;
      const resto = l.replace(prefijoBusqueda, '');
      return resto.length > 0 && !resto.slice(0, -1).includes('/');
    });
    
    const mapeosEspeciales: {[key: string]: string} = {
      'estmulo': 'estimulo',
      'estimulo': 'estimulo',
      'estímulo': 'estimulo'
    };
    
    this.validacionesCategorias = subdirs.map(dir => {
      let nombreDir = dir.replace(prefijoBusqueda, '');
      if (nombreDir.endsWith('/')) nombreDir = nombreDir.slice(0, -1);
      
      const categoria = categorias.find(cat => {
        const catNormalizada = normalizarNombre(cat.name);
        const dirNormalizada = normalizarNombre(nombreDir);
        
        const mapeoEspecial = mapeosEspeciales[dirNormalizada];
        if (mapeoEspecial && catNormalizada === mapeoEspecial) return true;
        
        return catNormalizada === dirNormalizada;
      });
      
      if (categoria) {
        return { dir: nombreDir, mensaje: `Categoría reconocida: ${categoria.name}`, color: 'success' };
      } else {
        return { dir: nombreDir, mensaje: `Categoría desconocida: ${nombreDir}`, color: 'warning' };
      }
    });
  }

  private validarSecciones(estructura: string, secciones: Section[]) {
    const lineas = estructura.split('\n').map(l => l.trim());
    const prefijoBusqueda = `[DIR] ${this.directorioBase}/`;
    
    const subdirs = lineas.filter(l => {
      if (!l.startsWith(prefijoBusqueda)) return false;
      const resto = l.replace(prefijoBusqueda, '');
      const segmentos = resto.split('/');
      return segmentos.length === 3 && segmentos[1].length > 0;
    });
    
    this.validacionesSecciones = subdirs.map(dir => {
      let nombreDir = dir.replace(prefijoBusqueda, '');
      if (nombreDir.endsWith('/')) nombreDir = nombreDir.slice(0, -1);
      
      const segmentos = nombreDir.split('/');
      const nombreSeccion = segmentos[1];
      
      const seccion = secciones.find(sec => {
        return normalizarNombre(sec.name) === normalizarNombre(nombreSeccion);
      });
      
      if (seccion) {
        return { dir: nombreDir, mensaje: `Sección reconocida: ${seccion.name}`, color: 'success' };
      } else {
        return { dir: nombreDir, mensaje: `Sección desconocida: ${nombreSeccion}`, color: 'warning' };
      }
    });
  }

  private validarCuartoNivel(estructura: string) {
    const lineas = estructura.split('\n').map(l => l.trim());
    const prefijoBusquedaDir = `[DIR] ${this.directorioBase}/`;
    const prefijoBusquedaArchivo = `      ${this.directorioBase}/`;
    
    const premiosValidos = [
      '1er PREMIO', '2do PREMIO', '3er PREMIO',
      'MENCION ESPECIAL', 'MENCION HONORIFICA',
      'RECHAZADA', 'FUERA DE REGLAMENTO',
      'PRIMER PREMIO', 'SEGUNDO PREMIO', 'TERCER PREMIO',
      'ACEPTADA', 'MENCION JURADO'
    ];
    
    const archivos = lineas.filter(l => l.startsWith(prefijoBusquedaArchivo));
    
    const archivosTercerNivel = archivos.filter(l => {
      const resto = l.replace(prefijoBusquedaArchivo, '');
      const segmentos = resto.split('/');
      return segmentos.length === 3;
    });
    
    const elementosTercerNivel = lineas.filter(l => {
      if (!l.startsWith(prefijoBusquedaDir) && !l.startsWith(prefijoBusquedaArchivo)) return false;
      const resto = l.replace(prefijoBusquedaDir, '').replace(prefijoBusquedaArchivo, '');
      const segmentos = resto.split('/');
      return segmentos.length === 3 && segmentos[2].length > 0;
    });
    
    this.validacionesPremios = [];
    this.fotografiasSinCatalogar = [];
    
    elementosTercerNivel.filter(el => el.startsWith('[DIR]')).forEach(elemento => {
      const resto = elemento.replace(prefijoBusquedaDir, '');
      const segmentos = resto.split('/');
      
      if (segmentos.length === 3) {
        const nombreElemento = segmentos[2];
        const rutaCompleta = `${this.directorioBase}/${segmentos[0]}/${segmentos[1]}/${nombreElemento}`;
        
        const premioValido = premiosValidos.find(premio => 
          normalizarNombre(premio) === normalizarNombre(nombreElemento)
        );
        
        if (premioValido) {
          this.validacionesPremios.push({
            dir: rutaCompleta,
            mensaje: `Premio válido: ${premioValido}`,
            color: 'success'
          });
        } else {
          this.validacionesPremios.push({
            dir: rutaCompleta,
            mensaje: `Premio desconocido: ${nombreElemento}`,
            color: 'warning'
          });
        }
      }
    });
    
    archivosTercerNivel.forEach((elemento) => {
      const resto = elemento.replace(prefijoBusquedaArchivo, '');
      const segmentos = resto.split('/');
      const nombreArchivo = segmentos[2];
      const rutaCompleta = `${this.directorioBase}/${segmentos[0]}/${segmentos[1]}/${nombreArchivo}`;
      this.fotografiasSinCatalogar.push(rutaCompleta);
    });
  }

  private validarQuintoNivel(estructura: string) {
    const lineas = estructura.split('\n').map(l => l.trim());
    
    const regexArchivo = new RegExp(`^${this.directorioBase}/`);
    const regexDir = new RegExp(`^\\[DIR\\] ${this.directorioBase}/`);
    
    const archivos = lineas.filter(l => l.match(regexArchivo) || l.match(regexDir));
    const archivosSolo = archivos.filter(l => !l.startsWith('[DIR]'));
    
    this.validacionesFotografias = [];
    this.fotografiasSinCatalogar = [];
    
    archivosSolo.forEach((archivo) => {
      const resto = archivo.replace(`${this.directorioBase}/`, '');
      const segmentos = resto.split('/');
      if (segmentos.length !== 4) {
        this.fotografiasSinCatalogar.push(`${this.directorioBase}/` + resto);
      }
    });
    
    if (this.fotografiasSinCatalogar.length > 0) {
      this.validacionesFotografias.push({
        dir: 'sinCatalogar',
        mensaje: `Se encontraron ${this.fotografiasSinCatalogar.length} fotografías fuera del 5to nivel (sin catalogar).`,
        color: 'danger'
      });
    }
  }

  // Convierte la estructura de texto a un JSON anidado
  estructuraToJson(): any {
    const lines = this.estructura.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const root: any = {};
    lines.forEach(line => {
      let path = line.replace('[DIR] ', '');
      const isDir = line.startsWith('[DIR]');
      const parts = path.split('/').filter(p => p.length > 0);
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          if (isDir) {
            if (!current[part]) current[part] = {};
          } else {
            if (!current['__files']) current['__files'] = [];
            current['__files'].push(part);
          }
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }
    });
    return root;
  }

  // Devuelve true si todas las validaciones pasan
  canCargarResultados(): boolean {
    if (!this.directorioBaseValido) return false;
    // Todas las validaciones deben ser 'success'
    const todasCategoriasOk = this.validacionesCategorias.every(v => v.color === 'success');
    const todasSeccionesOk = this.validacionesSecciones.every(v => v.color === 'success');
    const todosPremiosOk = this.validacionesPremios.every(v => v.color === 'success');
    // No debe haber fotografías sin catalogar
    if (this.fotografiasSinCatalogar.length > 0) return false;
    // No debe haber advertencias en validacionesFotografias
    const todasFotografiasOk = this.validacionesFotografias.every(v => v.color === 'success' || v.color === 'medium');
    return todasCategoriasOk && todasSeccionesOk && todosPremiosOk && todasFotografiasOk;
  }

  async cargarResultados() {
    const estructuraJson = this.estructuraToJson();
    await this.loadingService.present('Enviando resultados...');
    try {
      await axios.post(this.config.publicApiUrl('results/judging'), { estructura: estructuraJson });
      this.loadingService.dismiss();
      alert('Resultados cargados correctamente.');
    } catch (error: any) {
      this.loadingService.dismiss();
      let msg = 'Error al cargar resultados.';
      if (error?.response?.data?.message) {
        msg += '\n' + error.response.data.message;
      }
      alert(msg);
    }
  }
} 