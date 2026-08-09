import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InfiniteScrollDirective } from 'src/app/shared/infinite-scroll.directive';
import { VerFotografiasComponent } from 'src/app/concursos/concurso-detail/ver-fotografias/ver-fotografias.component';
import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Metric } from 'src/app/models/metric.model';
import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CategoryService } from 'src/app/services/category.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestService } from 'src/app/services/contest.service';
import { ImageSearchService } from 'src/app/services/image-search.service';
import { MetricAbmService } from 'src/app/services/metric-abm.service';
import { SectionService } from 'src/app/services/section.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

interface SearchResult {
  id: number;
  code: string;
  title: string;
  profile_id: number;
  url: string;
  author?: string;
  section?: string;
  contest?: { id: number; name: string; subtitle?: string | null } | null;
  category?: { id: number; name: string } | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, InfiniteScrollDirective],
  selector: 'app-busqueda-fotografias',
  templateUrl: './busqueda-fotografias.page.html',
  styleUrls: ['./busqueda-fotografias.page.scss']
})
export class BusquedaFotografiasPage implements OnInit {
  terminoBusqueda: string = '';
  resultados: SearchResult[] = [];
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  mostrarNota: boolean = true;

  concursos: Contest[] = [];
  concursoSeleccionado: number | undefined;

  secciones: { id: number; name: string }[] = [];
  categorias: { id: number; name: string }[] = [];
  puntajes: Metric[] = [];
  private _todasLasMetricas: Metric[] = [];

  sortBy: string = '';
  sortAsc: boolean = true;
  seccionesSeleccionadas: Set<number> = new Set();
  categoriasSeleccionadas: Set<number> = new Set();
  premiosSeleccionados: Set<string> = new Set();
  filtroAutor: string = '';
  filtroCodigo: string = '';
  private filterTimeout: any;

  sidebarVisible: boolean = false;

  public pageNumber = 1;
  public pageSize = 20;
  public hasMorePages = true;
  public loadingPage = false;
  public loadingInitial = false;

  user: UserLogged | null = null;

  private viewerData: any[] = [];

  constructor(
    public responsiveService: ResponsiveService,
    public UIUtilsService: UiUtilsService,
    private configService: ConfigService,
    private auth: AuthService,
    private imageSearchService: ImageSearchService,
    private contestService: ContestService,
    private sectionService: SectionService,
    private categoryService: CategoryService,
    private metricAbmService: MetricAbmService,
  ) {}

  get filtrosActivosCount(): number {
    let count = 0;
    if (this.concursoSeleccionado) count++;
    if (this.seccionesSeleccionadas.size > 0) count++;
    if (this.categoriasSeleccionadas.size > 0) count++;
    if (this.premiosSeleccionados.size > 0) count++;
    if (this.filtroAutor) count++;
    if (this.filtroCodigo) count++;
    return count;
  }

  get sortLabel(): string {
    if (!this.sortBy) return '';
    const labels: any = { title: 'Título', author: 'Autor', prize: 'Premio' };
    const dir = this.sortAsc ? '↑' : '↓';
    return `${labels[this.sortBy] || this.sortBy} ${dir}`;
  }

  get todasSecciones(): boolean {
    return this.seccionesSeleccionadas.size === 0;
  }

  get todasCategorias(): boolean {
    return this.categoriasSeleccionadas.size === 0;
  }

  get todosPremios(): boolean {
    return this.premiosSeleccionados.size === 0;
  }

  ngOnInit() {
    this.auth.user.then(u => this.user = u);
    this.cargarConcursos();
    this.cargarListasGlobales();
    this.cargarMetricas();
    this.realizarBusqueda();
  }

  ngOnDestroy() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
  }

  private cargarConcursos() {
    this.contestService.getAll<Contest>('per-page=1000').subscribe(cs => {
      this.concursos = cs || [];
    });
  }

  private cargarListasGlobales() {
    this.sectionService.getAll().subscribe(s => {
      this.secciones = (s || []).map(x => ({ id: x.id, name: x.name }));
    });
    this.categoryService.getAll().subscribe(c => {
      this.categorias = (c || []).map(x => ({ id: x.id, name: x.name }));
    });
  }

  private cargarMetricas() {
    this.metricAbmService.getAll().subscribe(s => {
      this._todasLasMetricas = s || [];
      this.filtrarMetricas();
    });
  }

  private filtrarMetricas() {
    if (!this._todasLasMetricas?.length) {
      this.puntajes = [];
      return;
    }
    const concurso = this.concursos.find(c => c.id === this.concursoSeleccionado);
    if (!concurso?.organization_type) {
      this.puntajes = [...this._todasLasMetricas];
      return;
    }
    this.puntajes = this._todasLasMetricas.filter(m => {
      if (!m.organization_type) return false;
      if (concurso.organization_type === 'EXTERNO_0') {
        return m.organization_type === 'EXTERNO' || m.organization_type === 'EXTERNO_0';
      }
      return m.organization_type === concurso.organization_type;
    });
  }

  onContestChange() {
    this.seccionesSeleccionadas.clear();
    this.categoriasSeleccionadas.clear();
    this.premiosSeleccionados.clear();

    if (this.concursoSeleccionado) {
      this.contestService.getSeccionesInscriptas(this.concursoSeleccionado).subscribe(si => {
        this.secciones = (si || []).map((x: ContestSectionExpanded) => ({ id: x.section.id, name: x.section.name }));
      });
      this.contestService.getCategoriasInscriptas(this.concursoSeleccionado).subscribe(ci => {
        this.categorias = (ci || []).map((x: ContestCategoryExpanded) => ({ id: x.category.id, name: x.category.name }));
      });
      this.filtrarMetricas();
    } else {
      this.cargarListasGlobales();
      this.filtrarMetricas();
    }

    this.realizarBusqueda();
  }

  async realizarBusqueda() {
    this.cargando = true;
    this.busquedaRealizada = true;
    this.pageNumber = 1;
    this.hasMorePages = true;
    this.loadingInitial = true;
    this.resultados = [];

    const response: any = await this.imageSearchService.search(this.buildParams(1, true));

    if (response && Array.isArray(response.data)) {
      this.resultados = response.data;
      this.cargando = false;
      this.loadingInitial = false;

      const meta = response._meta;
      if (meta && meta.currentPage !== undefined && meta.pageCount !== undefined) {
        this.hasMorePages = meta.currentPage < meta.pageCount;
      } else {
        this.hasMorePages = response.data.length >= this.pageSize;
      }
    } else {
      this.resultados = [];
      this.hasMorePages = false;
      this.cargando = false;
      this.loadingInitial = false;
    }
  }

  private buildParams(page: number, reset: boolean): any {
    return {
      search: this.terminoBusqueda || undefined,
      contest_id: this.concursoSeleccionado,
      page,
      perPage: this.pageSize,
      sort: this.sortBy || undefined,
      sort_dir: this.sortBy ? (this.sortAsc ? 'asc' : 'desc') : undefined,
      section_ids: this.seccionesSeleccionadas.size > 0 ? [...this.seccionesSeleccionadas] : undefined,
      category_ids: this.categoriasSeleccionadas.size > 0 ? [...this.categoriasSeleccionadas] : undefined,
      prizes: this.premiosSeleccionados.size > 0 ? [...this.premiosSeleccionados] : undefined,
      author: this.filtroAutor || undefined,
      code: this.filtroCodigo || undefined,
    };
  }

  async loadMoreImages() {
    if (!this.hasMorePages || this.loadingPage) {
      return;
    }
    this.loadingPage = true;
    const page = this.pageNumber + 1;
    const response: any = await this.imageSearchService.search(this.buildParams(page, false));
    const items: SearchResult[] = response?.data || [];

    if (items.length > 0) {
      this.resultados.push(...items);
      this.pageNumber = page;
    }

    const meta = response?._meta;
    if (meta && meta.currentPage !== undefined && meta.pageCount !== undefined) {
      this.hasMorePages = meta.currentPage < meta.pageCount;
    } else {
      this.hasMorePages = items.length >= this.pageSize;
    }
    this.loadingPage = false;
  }

  onFilterInput() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.realizarBusqueda();
    }, 1000);
  }

  onSearchChange() {
    this.realizarBusqueda();
  }

  onSortChangeManual(value: string) {
    if (this.sortBy === value) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = value;
      this.sortAsc = true;
    }
    this.realizarBusqueda();
  }

  toggleSeccion(id: number) {
    if (this.seccionesSeleccionadas.has(id))
      this.seccionesSeleccionadas.delete(id);
    else
      this.seccionesSeleccionadas.add(id);
    this.realizarBusqueda();
  }

  seccionAll() {
    this.seccionesSeleccionadas.clear();
    this.realizarBusqueda();
  }

  toggleCategoria(id: number) {
    if (this.categoriasSeleccionadas.has(id))
      this.categoriasSeleccionadas.delete(id);
    else
      this.categoriasSeleccionadas.add(id);
    this.realizarBusqueda();
  }

  categoriaAll() {
    this.categoriasSeleccionadas.clear();
    this.realizarBusqueda();
  }

  togglePremio(prize: string) {
    if (this.premiosSeleccionados.has(prize))
      this.premiosSeleccionados.delete(prize);
    else
      this.premiosSeleccionados.add(prize);
    this.realizarBusqueda();
  }

  premioAll() {
    this.premiosSeleccionados.clear();
    this.realizarBusqueda();
  }

  limpiarFiltros() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.terminoBusqueda = '';
    this.sortBy = '';
    this.sortAsc = true;
    this.concursoSeleccionado = undefined;
    this.seccionesSeleccionadas.clear();
    this.categoriasSeleccionadas.clear();
    this.premiosSeleccionados.clear();
    this.filtroAutor = '';
    this.filtroCodigo = '';
    this.cargarListasGlobales();
    this.filtrarMetricas();
    this.realizarBusqueda();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  cerrarNota() {
    this.mostrarNota = false;
  }

  getFotoThumb(result: SearchResult): string {
    if (!result?.url) return '';
    return this.configService.imageUrl(result.url);
  }

  openImage(index: number) {
    this.viewerData = [...this.resultados].map(r => ({
      image: { url: r.url, title: r.title, code: r.code },
      section: r.section ? { name: r.section } : undefined
    }));

    this.UIUtilsService.mostrarModal(VerFotografiasComponent, {
      index,
      all_data: this.viewerData,
      open: true,
      hasMore: this.hasMorePages,
      loadMoreImages: async () => {
        if (!this.hasMorePages || this.loadingPage) return;
        this.loadingPage = true;
        const page = this.pageNumber + 1;
        const response: any = await this.imageSearchService.search(this.buildParams(page, false));
        const items: SearchResult[] = response?.data || [];
        if (items.length > 0) {
          items.forEach(r => {
            this.viewerData.push({
              image: { url: r.url, title: r.title, code: r.code },
              section: r.section ? { name: r.section } : undefined
            });
          });
          this.resultados.push(...items);
          this.pageNumber = page;
        }
        const meta = response?._meta;
        if (meta && meta.currentPage !== undefined && meta.pageCount !== undefined) {
          this.hasMorePages = meta.currentPage < meta.pageCount;
        } else {
          this.hasMorePages = items.length >= this.pageSize;
        }
        this.loadingPage = false;
      }
    }, true);
  }
}
