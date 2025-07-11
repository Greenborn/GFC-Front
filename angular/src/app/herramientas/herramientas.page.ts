import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContestService } from '../services/contest.service';
import { Contest } from '../models/contest.model';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage implements OnInit {
  concursos: Contest[] = [];
  concursoSeleccionado: Contest | null = null;

  constructor(private router: Router, private contestService: ContestService) {}

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

  descargarListado() {
    // Aquí irá la lógica de descarga en el futuro
    if (this.concursoSeleccionado) {
      // Lógica de descarga
      alert('Descargar listado para: ' + this.concursoSeleccionado.name);
    }
  }
} 