import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/category.model';
import { Section } from '../../models/section.model';
import { ContestResultService } from '../../services/contest-result.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config/config.service';
import { LoadingController } from '@ionic/angular';

function normalizarNombre(nombre: string): string {
  // Quitar acentos, pasar a minúsculas, pero mantener espacios
  const normalizada = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar diacríticos (acentos)
    .toLowerCase()
    .trim();
  
  // Log para debug de normalización con acentos
  if (nombre !== normalizada) {
    console.log(`🔤 NORMALIZACIÓN: "${nombre}" → "${normalizada}"`);
  }
  
  return normalizada;
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
  secciones: Section[] = [];
  validacionesCategorias: {dir: string, mensaje: string, color: string}[] = [];
  validacionesSecciones: {dir: string, mensaje: string, color: string}[] = [];
  validacionesPremios: {dir: string, mensaje: string, color: string}[] = [];
  fotografiasSinCatalogar: string[] = [];
  validacionesFotografias: {dir: string, mensaje: string, color: string}[] = [];

  constructor(
    private router: Router,
    private contestResultService: ContestResultService,
    private http: HttpClient,
    private config: ConfigService,
    private loadingController: LoadingController
  ) {
    const nav = this.router.getCurrentNavigation();
    this.estructura = nav?.extras?.state?.estructura || '';
    this.categorias = nav?.extras?.state?.categorias || [];
    this.secciones = nav?.extras?.state?.secciones || [];
    
    console.log('=== CONSTRUCTOR CARGA RESULTADOS ===');
    console.log('Estructura recibida:', this.estructura ? 'SÍ' : 'NO');
    console.log('Categorías recibidas:', this.categorias.length);
    console.log('Secciones recibidas:', this.secciones.length);
    
    // Validar si existe el directorio exportacion en el primer nivel
    this.exportacionValida = this.validarDirectorioExportacion(this.estructura);
    console.log('Exportación válida:', this.exportacionValida);
    
    if (this.exportacionValida) {
      console.log('🔍 Iniciando validaciones...');
      this.validarCategorias(this.estructura, this.categorias);
      console.log('🔍 Llamando a validarSecciones...');
      this.validarSecciones(this.estructura, this.secciones);
      console.log('🔍 Llamando a validarCuartoNivel...');
      this.validarCuartoNivel(this.estructura);
      console.log('🔍 Llamando a validarQuintoNivel...');
      this.validarQuintoNivel(this.estructura);
      console.log('🔍 Validaciones completadas');
    }
  }

  ngOnInit(): void {}

  volver() {
    this.router.navigate(['/herramientas']);
  }

  obtenerNombreArchivo(ruta: string): string {
    const partes = ruta.split('/');
    const nombreArchivo = partes[partes.length - 1];
    console.log(`🔍 Extrayendo nombre de archivo: "${ruta}" → "${nombreArchivo}"`);
    return nombreArchivo;
  }

  private validarDirectorioExportacion(estructura: string): boolean {
    if (!estructura) return false;
    const lineas = estructura.split('\n').map(l => l.trim());
    return lineas.some(l => l === '[DIR] exportacion/' || l === '[DIR] exportacion');
  }

  private validarCategorias(estructura: string, categorias: Category[]) {
    console.log('=== DEBUG VALIDACIÓN CATEGORÍAS ===');
    console.log('Categorías recibidas:', categorias);
    console.log('Estructura completa:', estructura);
    
    // Log para ver todas las categorías y sus normalizaciones
    console.log('📋 TODAS LAS CATEGORÍAS Y SUS NORMALIZACIONES:');
    categorias.forEach((cat, index) => {
      const normalizada = normalizarNombre(cat.name);
      console.log(`  ${index + 1}. "${cat.name}" → "${normalizada}"`);
    });
    
    // Buscar directorios de segundo nivel bajo exportacion
    const lineas = estructura.split('\n').map(l => l.trim());
    // Solo directorios con exactamente un '/' después de 'exportacion/'
    const subdirs = lineas.filter(l => {
      if (!l.startsWith('[DIR] exportacion/')) return false;
      const resto = l.replace('[DIR] exportacion/', '');
      // Debe tener solo un segmento (sin más '/'), es decir, no recursivo
      return resto.length > 0 && !resto.slice(0, -1).includes('/');
    });
    
    console.log('Subdirectorios encontrados:', subdirs);
    
    this.validacionesCategorias = subdirs.map(dir => {
      // Obtener el nombre del subdirectorio
      let nombreDir = dir.replace('[DIR] exportacion/', '');
      if (nombreDir.endsWith('/')) nombreDir = nombreDir.slice(0, -1);
      
      console.log('Procesando directorio:', nombreDir);
      
      // Buscar si coincide con alguna categoría (ignorando acentos y mayúsculas)
      const categoria = categorias.find(cat => {
        const catNormalizada = normalizarNombre(cat.name);
        const dirNormalizada = normalizarNombre(nombreDir);
        console.log(`Comparando: "${dirNormalizada}" vs "${catNormalizada}" (original: "${cat.name}")`);
        
        // Mapeo especial para casos conocidos
        const mapeosEspeciales: {[key: string]: string} = {
          'estmulo': 'estimulo',  // Estmulo → Estímulo
          'estimulo': 'estimulo', // Estimulo → Estímulo (por si acaso)
          'estímulo': 'estimulo'  // Estímulo → Estímulo (con acento)
        };
        
        // Verificar si hay un mapeo especial para este directorio
        const mapeoEspecial = mapeosEspeciales[dirNormalizada];
        if (mapeoEspecial) {
          console.log(`🔧 APLICANDO MAPEO ESPECIAL: "${dirNormalizada}" → "${mapeoEspecial}"`);
          if (catNormalizada === mapeoEspecial) {
            console.log('✅ Coincidencia por mapeo especial');
            return true;
          }
        }
        
        // Log específico para Estmulo
        if (nombreDir.toLowerCase() === 'estmulo' || cat.name.toLowerCase().includes('estímulo')) {
          console.log('🔍 COMPARACIÓN ESPECIAL ESTÍMULO:');
          console.log('  - Directorio original:', nombreDir);
          console.log('  - Directorio normalizado:', dirNormalizada);
          console.log('  - Categoría original:', cat.name);
          console.log('  - Categoría normalizada:', catNormalizada);
          console.log('  - ¿Coinciden?', catNormalizada === dirNormalizada);
          
          // Log adicional para verificar la normalización
          if (cat.name.toLowerCase().includes('estímulo')) {
            console.log('🔧 DEBUG NORMALIZACIÓN:');
            console.log('  - Original:', cat.name);
            console.log('  - NFD:', cat.name.normalize('NFD'));
            console.log('  - Sin diacríticos:', cat.name.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
            console.log('  - Final:', normalizarNombre(cat.name));
          }
        }
        
        return catNormalizada === dirNormalizada;
      });
      
      if (categoria) {
        console.log('✅ Categoría encontrada:', categoria.name);
        return { dir: nombreDir, mensaje: `Categoría reconocida: ${categoria.name}`, color: 'success' };
      } else {
        console.log('❌ Categoría NO encontrada para:', nombreDir);
        return { dir: nombreDir, mensaje: `Categoría desconocida: ${nombreDir}`, color: 'warning' };
      }
    });
    
    console.log('Validaciones finales:', this.validacionesCategorias);
    console.log('=== FIN DEBUG ===');
  }

  private validarSecciones(estructura: string, secciones: Section[]) {
    console.log('🚀 INICIANDO validarSecciones ===');
    console.log('=== DEBUG VALIDACIÓN SECCIONES ===');
    console.log('Secciones recibidas:', secciones);
    
    // Log para ver todas las secciones y sus normalizaciones
    console.log('📋 TODAS LAS SECCIONES Y SUS NORMALIZACIONES:');
    secciones.forEach((sec, index) => {
      const normalizada = normalizarNombre(sec.name);
      console.log(`  ${index + 1}. "${sec.name}" → "${normalizada}"`);
    });
    
    // Buscar directorios de tercer nivel bajo exportacion/categoria/
    const lineas = estructura.split('\n').map(l => l.trim());
    console.log('📁 Todas las líneas de la estructura:', lineas);
    
    // Solo directorios con exactamente dos '/' después de 'exportacion/' (tercer nivel)
    const subdirs = lineas.filter(l => {
      if (!l.startsWith('[DIR] exportacion/')) return false;
      const resto = l.replace('[DIR] exportacion/', '');
      // Debe tener exactamente dos '/' (tres segmentos: categoria/seccion/)
      const segmentos = resto.split('/');
      const esValido = segmentos.length === 3 && segmentos[1].length > 0; // El segundo segmento es la sección
      console.log(`🔍 Analizando: "${l}" → segmentos: [${segmentos.join(', ')}] → válido: ${esValido}`);
      return esValido;
    });
    
    console.log('Subdirectorios de secciones encontrados:', subdirs);
    
    this.validacionesSecciones = subdirs.map(dir => {
      // Obtener el nombre del subdirectorio (sección)
      let nombreDir = dir.replace('[DIR] exportacion/', '');
      if (nombreDir.endsWith('/')) nombreDir = nombreDir.slice(0, -1);
      
      // Extraer solo el nombre de la sección (segundo segmento)
      const segmentos = nombreDir.split('/');
      const nombreSeccion = segmentos[1];
      const nombreCategoria = segmentos[0];
      
      console.log('Procesando sección:', nombreSeccion, 'en categoría:', nombreCategoria);
      
      // Buscar si coincide con alguna sección (ignorando acentos y mayúsculas)
      const seccion = secciones.find(sec => {
        const secNormalizada = normalizarNombre(sec.name);
        const dirNormalizada = normalizarNombre(nombreSeccion);
        console.log(`Comparando sección: "${dirNormalizada}" vs "${secNormalizada}" (original: "${sec.name}")`);
        
        return secNormalizada === dirNormalizada;
      });
      
      if (seccion) {
        console.log('✅ Sección encontrada:', seccion.name);
        return { dir: nombreDir, mensaje: `Sección reconocida: ${seccion.name}`, color: 'success' };
      } else {
        console.log('❌ Sección NO encontrada para:', nombreSeccion);
        return { dir: nombreDir, mensaje: `Sección desconocida: ${nombreSeccion}`, color: 'warning' };
      }
    });
    
    console.log('Validaciones de secciones finales:', this.validacionesSecciones);
    console.log('Cantidad de validaciones de secciones:', this.validacionesSecciones.length);
    console.log('=== FIN DEBUG SECCIONES ===');
  }

  private validarCuartoNivel(estructura: string) {
    console.log('🚀 INICIANDO validarCuartoNivel ===');
    console.log('=== DEBUG VALIDACIÓN CUARTO NIVEL ===');
    
    const lineas = estructura.split('\n').map(l => l.trim());
    console.log('📁 Analizando cuarto nivel de la estructura...');
    console.log(`📊 Total de líneas a procesar: ${lineas.length}`);
    
    // Premios válidos conocidos
    const premiosValidos = [
      '1er PREMIO', '2do PREMIO', '3er PREMIO',
      'MENCION ESPECIAL', 'MENCION HONORIFICA',
      'RECHAZADA', 'FUERA DE REGLAMENTO',
      'PRIMER PREMIO', 'SEGUNDO PREMIO', 'TERCER PREMIO',
      'ACEPTADA', 'MENCION JURADO'
    ];
    
    // Buscar elementos del tercer nivel (archivos sueltos y directorios de premios)
    const elementosTercerNivel = lineas.filter(l => {
      if (!l.startsWith('[DIR] exportacion/') && !l.startsWith('      exportacion/')) return false;
      const resto = l.replace('[DIR] exportacion/', '').replace('      exportacion/', '');
      const segmentos = resto.split('/');
      // Debe tener exactamente 3 segmentos (categoria/seccion/elemento)
      const esValido = segmentos.length === 3 && segmentos[2].length > 0;
      console.log(`🔍 Analizando tercer nivel: "${l}" → segmentos: [${segmentos.join(', ')}] → válido: ${esValido}`);
      return esValido;
    });
    
    // Debug: mostrar todas las líneas que contienen archivos
    console.log('🔍 Todas las líneas que contienen archivos:');
    const archivos = lineas.filter(l => l.startsWith('      exportacion/'));
    console.log(`Total de archivos encontrados: ${archivos.length}`);
    
    // Debug: mostrar archivos del tercer nivel específicamente
    console.log('🔍 Archivos del tercer nivel (categoria/seccion/archivo):');
    const archivosTercerNivel = archivos.filter(l => {
      const resto = l.replace('      exportacion/', '');
      const segmentos = resto.split('/');
      return segmentos.length === 3;
    });
    console.log(`Total de archivos del tercer nivel: ${archivosTercerNivel.length}`);
    
    // Mostrar solo los primeros 5 archivos del tercer nivel para debug
    console.log('🔍 Primeros 5 archivos del tercer nivel:');
    archivosTercerNivel.slice(0, 5).forEach((l, index) => {
      const resto = l.replace('      exportacion/', '');
      const segmentos = resto.split('/');
      console.log(`  ${index + 1}. "${l}" → segmentos: [${segmentos.join(', ')}]`);
    });
    
    console.log('🔍 Elementos del tercer nivel encontrados:', elementosTercerNivel);
    
    this.validacionesPremios = [];
    this.fotografiasSinCatalogar = [];
    
    // Procesar directorios de premios (elementos con 3 segmentos)
    elementosTercerNivel.filter(el => el.startsWith('[DIR]')).forEach(elemento => {
      const resto = elemento.replace('[DIR] exportacion/', '');
      const segmentos = resto.split('/');
      
      if (segmentos.length === 3) {
        const nombreElemento = segmentos[2];
        const rutaCompleta = `exportacion/${segmentos[0]}/${segmentos[1]}/${nombreElemento}`;
        
        console.log(`🔍 Procesando directorio de premio: "${nombreElemento}" en ruta: "${rutaCompleta}"`);
        
        const premioValido = premiosValidos.find(premio => 
          normalizarNombre(premio) === normalizarNombre(nombreElemento)
        );
        
        if (premioValido) {
          console.log(`✅ Premio válido: "${nombreElemento}" → "${premioValido}"`);
          this.validacionesPremios.push({
            dir: rutaCompleta,
            mensaje: `Premio válido: ${premioValido}`,
            color: 'success'
          });
        } else {
          console.log(`❌ Premio desconocido: "${nombreElemento}"`);
          this.validacionesPremios.push({
            dir: rutaCompleta,
            mensaje: `Premio desconocido: ${nombreElemento}`,
            color: 'warning'
          });
        }
      }
    });
    
    // Procesar archivos sueltos del tercer nivel
    console.log('🔍 Procesando archivos sueltos...');
    archivosTercerNivel.forEach((elemento, index) => {
      if (index < 10) { // Solo procesar los primeros 10 para debug
        const resto = elemento.replace('      exportacion/', '');
        const segmentos = resto.split('/');
        const nombreArchivo = segmentos[2];
        const rutaCompleta = `exportacion/${segmentos[0]}/${segmentos[1]}/${nombreArchivo}`;
        
        console.log(`📸 Fotografía suelta ${index + 1}: "${nombreArchivo}" en ruta: "${rutaCompleta}"`);
        this.fotografiasSinCatalogar.push(rutaCompleta);
      }
    });
    console.log(`📸 Total de fotografías sueltas procesadas: ${this.fotografiasSinCatalogar.length}`);
    
    console.log('🏆 Validaciones de premios finales:', this.validacionesPremios);
    console.log('📸 Fotografías sin catalogar:', this.fotografiasSinCatalogar);
    console.log('Cantidad de premios validados:', this.validacionesPremios.length);
    console.log('Cantidad de fotografías sin catalogar:', this.fotografiasSinCatalogar.length);
    
    // Debug: mostrar las primeras 5 fotografías
    if (this.fotografiasSinCatalogar.length > 0) {
      console.log('🔍 Primeras 5 fotografías sin catalogar:');
      this.fotografiasSinCatalogar.slice(0, 5).forEach((foto, index) => {
        console.log(`  ${index + 1}. ${foto}`);
      });
    }
    
    console.log('✅ FUNCIÓN validarCuartoNivel COMPLETADA');
    console.log('=== FIN DEBUG CUARTO NIVEL ===');
  }

  private validarQuintoNivel(estructura: string) {
    console.log('🚀 INICIANDO validarQuintoNivel ===');
    console.log('=== DEBUG VALIDACIÓN QUINTO NIVEL ===');
    
    const lineas = estructura.split('\n').map(l => l.trim());
    console.log('📁 Analizando quinto nivel de la estructura...');
    console.log(`📊 Total de líneas a procesar: ${lineas.length}`);
    
    // Buscar archivos en todos los niveles bajo exportacion
    const archivos = lineas.filter(l => l.match(/^exportacion\//) || l.match(/^\[DIR\] exportacion\//));
    // Solo archivos (no directorios)
    const archivosSolo = archivos.filter(l => !l.startsWith('[DIR]'));
    
    this.validacionesFotografias = [];
    this.fotografiasSinCatalogar = [];
    
    // Procesar todos los archivos
    archivosSolo.forEach((archivo) => {
      const resto = archivo.replace('exportacion/', '');
      const segmentos = resto.split('/');
      // Si el archivo está en el 5to nivel (4 segmentos antes del nombre de archivo), es válido
      if (segmentos.length === 4) {
        // Archivo correctamente catalogado, no hacer nada especial aquí
      } else {
        // Archivo fuera del 5to nivel, agregar a sin catalogar
        this.fotografiasSinCatalogar.push('exportacion/' + resto);
      }
    });
    
    // Mensaje de advertencia si hay fotografías sin catalogar
    if (this.fotografiasSinCatalogar.length > 0) {
      this.validacionesFotografias.push({
        dir: 'sinCatalogar',
        mensaje: `⚠️ Se encontraron ${this.fotografiasSinCatalogar.length} fotografías fuera del 5to nivel (sin catalogar).`,
        color: 'danger'
      });
    }
    
    console.log('✅ FUNCIÓN validarQuintoNivel COMPLETADA');
    console.log('=== FIN DEBUG QUINTO NIVEL ===');
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
    if (!this.exportacionValida) return false;
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
    const loading = await this.loadingController.create({
      message: 'Enviando resultados...'
    });
    await loading.present();
    try {
      const token = localStorage.getItem(this.config.tokenKey);
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
      const response = await this.http.post(
        this.config.publicApiUrl('api/results/judging'),
        { estructura: estructuraJson },
        { headers }
      ).toPromise();
      await loading.dismiss();
      alert('Resultados cargados correctamente.');
    } catch (error) {
      await loading.dismiss();
      let msg = 'Error al cargar resultados.';
      if (error instanceof HttpErrorResponse && error.error && error.error.message) {
        msg += '\n' + error.error.message;
      }
      alert(msg);
    }
  }
} 