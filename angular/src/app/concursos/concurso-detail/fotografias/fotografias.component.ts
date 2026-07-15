import { Component, OnInit } from '@angular/core';

import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { Metric } from 'src/app/models/metric.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { ConcursoDetailService } from '../concurso-detail.service';
import { VerFotografiasComponent } from '../ver-fotografias/ver-fotografias.component';
import { get_all } from '../../../services/contest-results.service'
import { FiltrosOrdenModalComponent, FiltrosOrdenState } from './filtros-orden-modal.component';
import { MetricAbmService } from 'src/app/services/metric-abm.service';
import { InscribirConcursanteComponent } from '../inscribir-concursante/inscribir-concursante.component';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-fotografias',
  templateUrl: './fotografias.component.html',
  styleUrls: ['./fotografias.component.scss'],
})
export class FotografiasComponent implements OnInit {

  concurso: any = null;
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  seccionesInscriptas: ContestSectionExpanded[] = [];
  resultadosConcurso: ContestResultExpanded[] = [];
  resultadosConcursoOrig: ContestResultExpanded[] = [];
  fotoclubs: Fotoclub[] = [];
  user: UserLogged;

  puntajes: Metric[] = [];
  propiasFotos: ContestResultExpanded[] = [];
  propiasExpandidas: boolean = true;


  sidebarVisible: boolean = false;
  sortBy: string = '';
  sortAsc: boolean = true;
  seccionesSeleccionadas: Set<number> = new Set();
  categoriasSeleccionadas: Set<number> = new Set();
  premiosSeleccionados: Set<string> = new Set();
  filtroAutor: string = '';
  filtroCodigo: string = '';
  terminoBusqueda: string = '';
  private filterTimeout: any;

  public subscriptions = []

  public pageNumber = 1;
  public pageSize = 20;
  public hasMorePages = true;
  public loadingPage = false;
  public loadingInitial = false;
  private pendingRefresh = false;

  constructor(
    public concursoDetailService: ConcursoDetailService,
    public contestService: ContestService,
    public UIUtilsService: UiUtilsService,
    public responsiveService: ResponsiveService,
    private configService: ConfigService,
    public rolificador: RolificadorService,
    public auth: AuthService,
    private metricAbmService: MetricAbmService,
  ) {
    this.subscribes()
  }

  get isContestNotFin() {
    let finalizado = (new Date()).getTime() >= (new Date(this.concurso.end_date)).getTime()
    return !(finalizado && this.concurso.judged)
  }

  get isContestJudged(): boolean {
    let finalizado = (new Date()).getTime() >= (new Date(this.concurso.end_date)).getTime()
    return finalizado && this.concurso.judged
  }

  get aspecto() {
    return document.body.classList.contains("dark")
  }

  get filtrosActivosCount(): number {
    let count = 0;
    if (this.seccionesSeleccionadas.size > 0) count++;
    if (this.categoriasSeleccionadas.size > 0) count++;
    if (this.premiosSeleccionados.size > 0) count++;
    if (this.filtroAutor && this.canFilterByAuthor) count++;
    if (this.filtroCodigo) count++;
    return count;
  }

  get canFilterByAuthor(): boolean {
    if (!this.user) return true;
    return this.isContestJudged || !this.rolificador.esConcursante(this.user);
  }

  get sortLabel(): string {
    if (!this.sortBy) return '';
    const labels = { title: 'Título', author: 'Autor', prize: 'Premio' };
    const dir = this.sortAsc ? '↑' : '↓';
    return `${labels[this.sortBy] || this.sortBy} ${dir}`;
  }

  isLogedIn() {
    return this.auth.loggedIn;
  }

  setResultadosConcurso(rs) {
    this.resultadosConcurso = rs || [];

    this.resultadosConcurso.forEach(e => {
      e.section = this.seccionesInscriptas.find(s => s.section.id === e.section_id)?.section;
    });

    this.resultadosConcursoOrig = [...this.resultadosConcurso];
  }

  get resultadosConcursoFiltrados() {
    if (this.resultadosConcurso == undefined) {
      return []
    }
    let items = this.resultadosConcurso;
    if (this.propiasFotos.length > 0) {
      const ids = new Set(this.propiasFotos.map(p => p.id));
      items = items.filter(r => !ids.has(r.id));
    }
    return items
  }

  async loadPage(page: number = 1, reset: boolean = false, showLoading: boolean = true) {
    if (this.loadingPage || !this.concurso?.id) {
      return;
    }

    if (reset) {
      this.pageNumber = 1;
      this.hasMorePages = true;
      this.resultadosConcurso = [];
      this.resultadosConcursoOrig = [];
      this.loadingInitial = true;
    }

    this.loadingPage = true;

    if (!this.canFilterByAuthor) {
      if (this.sortBy === 'author') this.sortBy = '';
      this.filtroAutor = '';
    }

    const response: any = await get_all({
      contest_id: this.concurso.id,
      page,
      perPage: this.pageSize,
      present_loading: showLoading && reset,
      search: this.terminoBusqueda || undefined,
      sort: this.sortBy || undefined,
      sort_dir: this.sortBy ? (this.sortAsc ? 'asc' : 'desc') : undefined,
      section_ids: this.seccionesSeleccionadas.size > 0 ? [...this.seccionesSeleccionadas] : undefined,
      category_ids: this.categoriasSeleccionadas.size > 0 ? [...this.categoriasSeleccionadas] : undefined,
      prizes: this.premiosSeleccionados.size > 0 ? [...this.premiosSeleccionados] : undefined,
      author: this.filtroAutor || undefined,
      code: this.filtroCodigo || undefined,
      skipPublish: true,
    });

    if (!response || !Array.isArray(response.items)) {
      this.hasMorePages = false;
      this.finishLoading();
      return;
    }

    const items = response.items || [];
    const allItems = reset ? items : [...this.resultadosConcursoOrig, ...items];

    this.setResultadosConcurso(allItems);
    this.pageNumber = page;

    if (response.page !== undefined && response.pages !== undefined) {
      this.hasMorePages = response.page < response.pages;
    } else if (response.total !== undefined) {
      this.hasMorePages = this.resultadosConcursoOrig.length < response.total;
    } else {
      this.hasMorePages = items.length >= this.pageSize;
    }

    this.finishLoading();
  }

  private finishLoading() {
    this.loadingPage = false;
    this.loadingInitial = false;
    if (this.pendingRefresh) {
      this.pendingRefresh = false;
      this.loadPage(1, true);
      this.cargarPropiasFotos();
    }
  }

  loadMoreImages() {
    if (!this.hasMorePages) {
      return;
    }
    this.loadPage(this.pageNumber + 1, false);
  }

  subscribes() {
    this.subscriptions.push(this.concursoDetailService.categoriasInscriptas.subscribe(cs => this.categoriasInscriptas = cs))
    this.subscriptions.push(this.concursoDetailService.seccionesInscriptas.subscribe(cs => this.seccionesInscriptas = cs))
    this.subscriptions.push(this.concursoDetailService.concursantes.subscribe(
      cs => { this.concursantes = cs; }
    ))
    this.subscriptions.push(this.concursoDetailService.inscriptos.subscribe(cs =>{
      this.inscriptos = cs
    }))
    if (this.concurso === null)
      this.subscriptions.push(this.concursoDetailService.concurso.subscribe(async c => {
        this.concurso = c
        if (this.concurso && this.concurso.id) {
          await this.loadPage(1, true, true)
          this.cargarPropiasFotos();
        }
      }))

    this.subscriptions.push(this.concursoDetailService.refreshPhotos.subscribe(async () => {
      if (this.loadingPage) {
        this.pendingRefresh = true;
        return;
      }
      await new Promise(r => setTimeout(r, 1000));
      await this.loadPage(1, true);
      await this.cargarPropiasFotos();
    }))
  }

  unsuscribes() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe()
    }
    this.subscriptions = []
  }

  async ngOnInit() {
    this.auth.user.then(u => {
      this.user = u;
      if (this.concurso?.id) this.cargarPropiasFotos();
    });
    this.cargarMetricas();
  }

  cargarMetricas() {
    this.metricAbmService.getAll().subscribe(s => {
      this.puntajes = s;
    });
  }

  async cargarPropiasFotos() {
    if (!this.user?.profile_id || !this.concurso?.id) {
      this.propiasFotos = [];
      return;
    }
    const response: any = await get_all({
      contest_id: this.concurso.id,
      concursante_id: this.user.profile_id,
      page: 1,
      perPage: 100,
      present_loading: false,
      skipPublish: true,
    });
    const items: ContestResultExpanded[] = response?.items || [];
    this.propiasFotos = items.filter(r => r.image?.profile_id === this.user.profile_id);
  }

  async ngOnDestroy() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.unsuscribes()
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  async openFilterModal() {
    const result = await this.UIUtilsService.mostrarModal(
      FiltrosOrdenModalComponent,
      {
        sortBy: this.sortBy,
        sortAsc: this.sortAsc,
        seccionesInscriptas: this.seccionesInscriptas,
        categoriasInscriptas: this.categoriasInscriptas,
        puntajes: this.puntajes,
        isContestJudged: this.isContestJudged,
        canFilterByAuthor: this.canFilterByAuthor,
        seccionesSeleccionadas: [...this.seccionesSeleccionadas],
        categoriasSeleccionadas: [...this.categoriasSeleccionadas],
        premiosSeleccionados: [...this.premiosSeleccionados],
        filtroAutor: this.filtroAutor,
        filtroCodigo: this.filtroCodigo,
      },
      true
    );

    if (!result) return;

      const state = result as FiltrosOrdenState;
    if (state.sortBy !== undefined) this.sortBy = state.sortBy || '';
    if (state.sortAsc !== undefined) this.sortAsc = state.sortAsc;
    this.seccionesSeleccionadas = new Set(state.seccionesSeleccionadas || []);
    this.categoriasSeleccionadas = new Set(state.categoriasSeleccionadas || []);
    this.premiosSeleccionados = new Set(state.premiosSeleccionados || []);
    this.filtroAutor = state.filtroAutor || '';
    this.filtroCodigo = state.filtroCodigo || '';
    this.loadPage(1, true, false);
  }

  onFilterInput() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.loadPage(1, true, false);
    }, 1000);
  }

  onSearchChange(event: any) {
    this.terminoBusqueda = event.detail?.value || '';
    this.loadPage(1, true, false);
  }

  onSortChange(event: any) {
    this.sortBy = event.detail?.value || '';
    this.loadPage(1, true, false);
  }

  onSortChangeManual(value: string) {
    if (this.sortBy === value) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = value;
      this.sortAsc = true;
    }
    this.loadPage(1, true, false);
  }

  setSortBy(value: string) {
    if (this.sortBy === value) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortBy = value;
      this.sortAsc = true;
    }
    this.loadPage(1, true, false);
  }

  toggleSortDir() {
    this.sortAsc = !this.sortAsc;
    this.loadPage(1, true, false);
  }

  toggleSeccion(id: number) {
    if (this.seccionesSeleccionadas.has(id))
      this.seccionesSeleccionadas.delete(id);
    else
      this.seccionesSeleccionadas.add(id);
    this.loadPage(1, true, false);
  }

  seccionAll() {
    this.seccionesSeleccionadas.clear();
    this.loadPage(1, true, false);
  }

  get todasSecciones(): boolean {
    return this.seccionesSeleccionadas.size === 0;
  }

  toggleCategoria(id: number) {
    if (this.categoriasSeleccionadas.has(id))
      this.categoriasSeleccionadas.delete(id);
    else
      this.categoriasSeleccionadas.add(id);
    this.loadPage(1, true, false);
  }

  categoriaAll() {
    this.categoriasSeleccionadas.clear();
    this.loadPage(1, true, false);
  }

  get todasCategorias(): boolean {
    return this.categoriasSeleccionadas.size === 0;
  }

  togglePremio(prize: string) {
    if (this.premiosSeleccionados.has(prize))
      this.premiosSeleccionados.delete(prize);
    else
      this.premiosSeleccionados.add(prize);
    this.loadPage(1, true, false);
  }

  premioAll() {
    this.premiosSeleccionados.clear();
    this.loadPage(1, true, false);
  }

  get todosPremios(): boolean {
    return this.premiosSeleccionados.size === 0;
  }

  limpiarFiltros() {
    if (this.filterTimeout) clearTimeout(this.filterTimeout);
    this.sortBy = '';
    this.sortAsc = true;
    this.terminoBusqueda = '';
    this.seccionesSeleccionadas.clear();
    this.categoriasSeleccionadas.clear();
    this.premiosSeleccionados.clear();
    this.filtroAutor = '';
    this.filtroCodigo = '';
    this.loadPage(1, true, false);
  }

  getThumbUrl(obj: any, thumb_id: number = 1) {
    if (obj == null) {
      return '';
    }
    if (obj !== undefined && (obj.length === undefined || obj.length == 0)) {
      return this.configService.imageUrl(obj.url);
    }
    for (let c = 0; c < obj.length; c++) {
      if (obj[c].thumbnail_type == thumb_id) {
        return this.configService.imageUrl(obj[c].url);
      }
    }
    return '';
  }

  checkPermissions(reg: any) {
    return this.contestService.isActive(this.concurso) &&
      (this.user != undefined ? (this.rolificador.esDelegado(this.user) || this.rolificador.isAdmin(this.user) || (this.rolificador.esConcursante(this.user) && reg?.image?.profile_id == this.user.profile_id)) : false)
  }

  getFotoclubName(profile_id: number): string {
    const profile = this.inscriptos.find(p => p.profile_id == profile_id);
    if (profile != undefined) {
      if (profile.profile.fotoclub == null) {
        return '';
      } else {
        return profile.profile.fotoclub.name;
      }
    }
    return '';
  }

  getFullName(profile_id: number) {
    const p = this.inscriptos.find(p => p.profile_id == profile_id)
    return p != undefined ? `${p.profile.name} ${p.profile.last_name}` : ''
  }

  async postImage(image: Image = undefined, section_id: number = undefined) {
    const user = this.user;
    if (user?.profile_id && this.rolificador.esConcursante(user)) {
      const inscripto = this.inscriptos.find(i => i.profile_id === user.profile_id);
      if (!inscripto) {
        const result = await this.UIUtilsService.mostrarModal(InscribirConcursanteComponent, {
          concursantes: [user.profile],
          contest: this.concurso,
          categorias: this.categoriasInscriptas.map(c => c.category),
          profileContest: {} as any,
        });
        if (!result?.profileContest) return;
        this.concursoDetailService.loadContest(this.concurso.id);
        await firstValueFrom(
          this.concursoDetailService.inscriptos.pipe(
            filter(cs => cs.some(i => i.profile_id === user.profile_id))
          )
        );
      }
    }

    if (section_id == undefined) {
      section_id = this.seccionesSeleccionadas.size > 0 ? [...this.seccionesSeleccionadas][0] : undefined
    }
    let section_max = this.concurso.max_img_section
    let resultados = this.resultadosConcurso

    this.concursoDetailService.postImage.emit({
      image,
      section_id,
      section_max,
      resultados
    });
  }

  private viewerData: any[] = [];

  openImage(index: any, data?: any[]) {
    this.viewerData = data ? [...data] : [...this.resultadosConcursoFiltrados];

    this.UIUtilsService.mostrarModal(VerFotografiasComponent, {
      index,
      all_data: this.viewerData,
      open: this.isContestNotFin,
      hasMore: this.hasMorePages,
      loadMoreImages: async () => {
        if (!this.hasMorePages || this.loadingPage) return;
        this.loadingPage = true;
        const page = this.pageNumber + 1;
        const response: any = await get_all({
          contest_id: this.concurso.id,
          page,
          perPage: this.pageSize,
          present_loading: false,
          search: this.terminoBusqueda || undefined,
          sort: this.sortBy || undefined,
          sort_dir: this.sortBy ? (this.sortAsc ? 'asc' : 'desc') : undefined,
          section_ids: this.seccionesSeleccionadas.size > 0 ? [...this.seccionesSeleccionadas] : undefined,
          category_ids: this.categoriasSeleccionadas.size > 0 ? [...this.categoriasSeleccionadas] : undefined,
          prizes: this.premiosSeleccionados.size > 0 ? [...this.premiosSeleccionados] : undefined,
          author: this.filtroAutor || undefined,
          code: this.filtroCodigo || undefined,
          skipPublish: true,
        });
        const items = response?.items || [];
        if (items.length > 0) {
          items.forEach(e => {
            e.section = this.seccionesInscriptas.find(s => s.section.id === e.section_id)?.section;
          });
          this.viewerData.push(...items);
          this.resultadosConcurso.push(...items);
          this.resultadosConcursoOrig.push(...items);
          this.pageNumber = page;
        }
        this.hasMorePages = items.length >= this.pageSize;
        this.loadingPage = false;
      }
    }, true);
  }

  can_delete(r: any) {
    const ES_MIA = r['image'].profile_id == this.user?.profile_id
    return ES_MIA && this.concurso.active
  }

  can_edit(r: any) {
    const ES_MIA = r['image'].profile_id == this.user?.profile_id
    return ES_MIA && this.concurso.active
  }

  async mostrarAcciones(ev: any, r: ContestResultExpanded, index: any, data?: any[]) {
    const image = r.image
    const acciones = [
      {
        accion: (params: []) => this.openImage(index, data),
        params: [],
        icon: 'image-outline',
        label: 'Ver'
      }
    ]
    if (this.checkPermissions) {
      if (this.rolificador.esJuez(this.user)) {
        acciones.push(
          {
            accion: (params: []) => this.concursoDetailService.reviewImage.emit(r),
            params: [],
            icon: 'star-outline',
            label: 'Puntuar'
          }
        )
      }

      if (this.can_edit(r)) {
        acciones.push({
          accion: (params: []) => this.postImage(image, r.section_id),
          params: [],
          icon: 'create',
          label: 'Editar'
        })
      }

      if (this.can_delete(r)) {
        acciones.push({
          accion: (params: number[]) => this.concursoDetailService.deleteImage.emit(r),
          params: [],
          icon: 'trash',
          label: 'Borrar'
        })

      }

    }
    const options = {
      component: MenuAccionesComponent,
      componentProps: {
        acciones
      },
      cssClass: 'auto-width',
      event: ev,
      translucent: true,
    }

    this.concursoDetailService.mostrarAcciones.emit(options)
  }
}
