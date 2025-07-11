import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-herramientas',
  templateUrl: './herramientas.page.html',
  styleUrls: ['./herramientas.page.scss']
})
export class HerramientasPage {
  constructor(private router: Router) {}

  abrirBusquedaFotografias() {
    this.router.navigate(['/herramientas/busqueda-fotografias']);
  }
} 