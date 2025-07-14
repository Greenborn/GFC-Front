import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/category.model';
import { Section } from '../../models/section.model';

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

  constructor(private router: Router) {
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
      console.log('🔍 Validaciones completadas');
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
} 