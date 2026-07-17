import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import axios from 'axios';
import { ConfigService } from '../../services/config/config.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-busqueda-fotografias',
  templateUrl: './busqueda-fotografias.page.html',
  styleUrls: ['./busqueda-fotografias.page.scss']
})
export class BusquedaFotografiasPage {
  terminoBusqueda: string = '';
  resultados: any[] = [];
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  mostrarNota: boolean = true;

  constructor(
    private config: ConfigService
  ) {}

  cerrarNota() {
    this.mostrarNota = false;
  }

  abrirImagen(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  async realizarBusqueda() {
    if (!this.terminoBusqueda.trim()) return;
    
    this.cargando = true;
    this.busquedaRealizada = true;
    
    try {
      const url = this.config.publicApiUrl(`images/search?q=${encodeURIComponent(this.terminoBusqueda)}`);
      const response = (await axios.get(url)).data;
      
      this.resultados = response.data || response || [];
    } catch (error) {
      console.error('Error en búsqueda:', error);
      this.resultados = [];
    } finally {
      this.cargando = false;
    }
  }
} 