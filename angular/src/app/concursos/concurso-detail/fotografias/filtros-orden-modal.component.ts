import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Metric } from 'src/app/models/metric.model';

export interface FiltrosOrdenState {
  sortBy: string;
  sortAsc: boolean;
  seccionesSeleccionadas: number[];
  categoriasSeleccionadas: number[];
  premiosSeleccionados: string[];
  filtroAutor: string;
  filtroCodigo: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-filtros-orden-modal',
  templateUrl: './filtros-orden-modal.component.html',
  styleUrls: ['./filtros-orden-modal.component.scss'],
})
export class FiltrosOrdenModalComponent implements OnInit {

  @Input() modalController: any;
  @Input() sortBy: string;
  @Input() sortAsc: boolean;
  @Input() seccionesInscriptas: ContestSectionExpanded[];
  @Input() categoriasInscriptas: ContestCategoryExpanded[];
  @Input() puntajes: Metric[];
  @Input() isContestJudged: boolean;
  @Input() canFilterByAuthor: boolean;
  @Input() seccionesSeleccionadas: number[];
  @Input() categoriasSeleccionadas: number[];
  @Input() premiosSeleccionados: string[];
  @Input() filtroAutor: string;
  @Input() filtroCodigo: string;

  localSortBy: string;
  localSortAsc: boolean;
  localSecciones: Set<number>;
  localCategorias: Set<number>;
  localPremios: Set<string>;
  localFiltroAutor: string;
  localFiltroCodigo: string;

  ngOnInit() {
    this.localSortBy = this.sortBy || '';
    this.localSortAsc = this.sortAsc !== false;
    this.localSecciones = new Set(this.seccionesSeleccionadas || []);
    this.localCategorias = new Set(this.categoriasSeleccionadas || []);
    this.localPremios = new Set(this.premiosSeleccionados || []);
    this.localFiltroAutor = this.filtroAutor || '';
    this.localFiltroCodigo = this.filtroCodigo || '';
  }

  get hasSort(): boolean {
    return this.localSortBy != null && this.localSortBy !== '';
  }

  onSortChange(event: any) {
    this.localSortBy = event.detail.value || '';
  }

  dismiss() {
    this.modalController.dismiss({
      sortBy: this.localSortBy || '',
      sortAsc: this.localSortAsc,
      seccionesSeleccionadas: [...this.localSecciones],
      categoriasSeleccionadas: [...this.localCategorias],
      premiosSeleccionados: [...this.localPremios],
      filtroAutor: this.localFiltroAutor,
      filtroCodigo: this.localFiltroCodigo,
    });
  }

  toggleSortDir() {
    this.localSortAsc = !this.localSortAsc;
  }

  toggleSeccion(id: number) {
    if (this.localSecciones.has(id))
      this.localSecciones.delete(id);
    else
      this.localSecciones.add(id);
  }

  seccionAll() {
    this.localSecciones.clear();
  }

  get todasSecciones(): boolean {
    return this.localSecciones.size === 0;
  }

  toggleCategoria(id: number) {
    if (this.localCategorias.has(id))
      this.localCategorias.delete(id);
    else
      this.localCategorias.add(id);
  }

  categoriaAll() {
    this.localCategorias.clear();
  }

  get todasCategorias(): boolean {
    return this.localCategorias.size === 0;
  }

  resetAll() {
    this.localSortBy = '';
    this.localSortAsc = true;
    this.localSecciones.clear();
    this.localCategorias.clear();
    this.localPremios.clear();
    this.localFiltroAutor = '';
    this.localFiltroCodigo = '';
  }

  togglePremio(prize: string) {
    if (this.localPremios.has(prize))
      this.localPremios.delete(prize);
    else
      this.localPremios.add(prize);
  }

  premioAll() {
    this.localPremios.clear();
  }

  get todosPremios(): boolean {
    return this.localPremios.size === 0;
  }
}
