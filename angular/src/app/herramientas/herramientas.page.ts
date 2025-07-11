import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContestService } from '../services/contest.service';
import { Contest } from '../models/contest.model';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage implements OnInit {
  concursos: Contest[] = [];
  concursoSeleccionado: Contest | null = null;

  constructor(private router: Router, private contestService: ContestService, private http: HttpClient) {}

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
    if (!this.concursoSeleccionado) return;
    const id = this.concursoSeleccionado.id;
    const url = `https://gfc.api2.greenborn.com.ar/api/contests/participants?id=${id}`;
    this.http.get<any>(url).subscribe(response => {
      if (response && response.participants) {
        const data = response.participants.map(p => ({
          Nombre: p.name,
          Apellido: p.last_name,
          Categoria: p.category_name
        }));
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Participantes');
        XLSX.writeFile(wb, `participantes_concurso_${id}.xlsx`);
      }
    });
  }
} 