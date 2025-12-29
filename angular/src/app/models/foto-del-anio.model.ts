export interface FotoDelAnio {
  id: number;
  id_foto: number;
  puesto: string;
  orden: number;
  temporada: number;
  nombre_obra: string;
  nombre_autor: string;
  url_imagen: string;
}

export interface FotosDelAnioResponse {
  items: FotoDelAnio[];
  temporada: number;
  url_grabacion?: string | null;
}

export interface ItemConcursoOFoto {
  tipo: 'concurso' | 'fotos-anio';
  concurso?: any;
  fotosAnio?: FotoDelAnio[];
  temporada?: number;
  url_grabacion?: string | null;
}
