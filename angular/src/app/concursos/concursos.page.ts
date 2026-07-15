import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { NotificacionesPage } from '../notificaciones/notificaciones.page';
import { UsuarioPage } from '../usuario/usuario.page';
import { SearchBarComponentAtributo } from '../shared/search-bar/search-bar.component';
import { ContestService } from '../services/contest.service';
import { ApiConsumer } from '../models/ApiConsumer';
import { Contest } from '../models/contest.model';
import { AuthService } from '../modules/auth/services/auth.service';
import { ConfigService } from '../services/config/config.service';
import { RolificadorService } from '../modules/auth/services/rolificador.service';
import { AlertService } from '../services/ui/alert.service';
import { UiUtilsService } from '../services/ui/ui-utils.service';
import { ResponsiveService } from '../services/ui/responsive.service';
import { FotosDelAnioResponse, ItemConcursoOFoto } from '../models/foto-del-anio.model';
import { takeUntil } from 'rxjs/operators';
@Component({
  standalone: false,
  selector: 'app-concursos',
  templateUrl: './concursos.page.html',
  styleUrls: ['./concursos.page.scss'],
})
export class ConcursosPage extends ApiConsumer implements OnInit {

  markChip: boolean = false;
  public loading: boolean = true;
  anchoImg: boolean = false;
  // public concursos: Concurso[] = [];
  public concursos: Contest[] = [];
  public allItems: ItemConcursoOFoto[] = [];
  public itemGroups: ItemConcursoOFoto[][] = [];
  public fotosDelAnioPorTemporada: Map<number, FotosDelAnioResponse> = new Map();
  public concursoPage: number = 1;
  public concursoPageSize: number = 20;
  public itemsChunkSize: number = 4;
  public hasMoreConcursos: boolean = true;
  public loadingMore: boolean = false;
  public searchQuery: string = '';
  public searchAttribute: string = '';
  public currentSearchQuery: string = '';
  public currentSearchAttribute?: string;
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { valor: 'name', valorMostrado: 'Nombre',
      callback: (c: Contest, query: string) => c.name.match(new RegExp(`^${query}`, 'i'))
    },
    // { valor: 'description', valorMostrado: 'Descripcion',
    //   callback: (c: Contest, query: string) => c.description.match(new RegExp(`^${query}`, 'i'))
    // }
  ];

  constructor(
    private router: Router,
    public auth: AuthService,
    public contestService: ContestService,
    public rolificador: RolificadorService,
    alertController: AlertService,
    public configService: ConfigService,
    public responsiveService: ResponsiveService,
    private http: HttpClient,
    public UIUtilsService: UiUtilsService
  ) { 
    super(alertController)
  }
  get aspecto() {
    return document.body.classList.contains("dark")
   }
   
  getImg(imgUrl: string | null | undefined): string {
    if (imgUrl == null) {
      return '';
    }
    const result = this.configService.imageUrl(imgUrl);
    return result ?? '';
  }
    
  obtenerTamanio(event: any) {
    this.anchoImg = event.srcElement.offsetWidth > event.srcElement.offsetEight;
  }

  get_fecha_formateada(fecha: string | number | Date): string {
    const date = new Date(fecha);
    let aux = date.getFullYear() + '/' + Number(date.getMonth() + 1).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    }) + '/' + Number(date.getDate()).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    })
    aux += ' ' + Number(date.getHours()).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    }) + ':' + Number(date.getMinutes()).toLocaleString(undefined, {
      minimumIntegerDigits: 2,
      minimumFractionDigits: 0
    })
    return aux
  }

  private inicializado = false;

  ngOnInit() {
    if (!this.inicializado) {
      this.inicializado = true;
      this.cargarConcursosInicial();
    }
  }

  private cargarConcursosInicial() {
    this.loading = true;
    this.concursoPage = 1;
    this.hasMoreConcursos = true;
    this.concursos = [];
    this.allItems = [];
    this.itemGroups = [];
    this.fotosDelAnioPorTemporada.clear();
    this.currentSearchQuery = '';
    this.currentSearchAttribute = undefined;
    this.cargarFotosDelAnio();
    this.loadConcursos();
  }

  ionViewWillEnter() {
    if (!this.inicializado) {
      this.inicializado = true;
      this.loading = true;
      this.concursoPage = 1;
      this.hasMoreConcursos = true;
      this.concursos = [];
      this.allItems = [];
      this.itemGroups = [];
      this.fotosDelAnioPorTemporada.clear();
      this.currentSearchQuery = '';
      this.currentSearchAttribute = undefined;
      this.cargarFotosDelAnio();
      this.loadConcursos();
    }
  }

  onSearch() {
    this.searchQuery = this.searchQuery?.trim() ?? '';
    this.currentSearchQuery = this.searchQuery;
    this.concursoPage = 1;
    this.hasMoreConcursos = true;
    this.concursos = [];
    this.allItems = [];
    this.itemGroups = [];
    this.fotosDelAnioPorTemporada.clear();
    this.cargarFotosDelAnio();
    this.loadConcursos();
  }

  private getPageParams(page: number = this.concursoPage): string {
    let params = `expand=categories,sections&sort=-id&page=${page}&per-page=${this.concursoPageSize}`;
    if (this.currentSearchQuery && this.currentSearchQuery.length > 0) {
      params += `&search=${encodeURIComponent(this.currentSearchQuery)}`;
    }
    return params;
  }

  private loadConcursos(page: number = 1) {
    const pageParams = this.getPageParams(page);
    this.contestService.getAll(pageParams).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: concursos => {
        this.loading = false;
        if (concursos && concursos.length > 0) {
          this.concursos.push(...concursos);
          const nuevosItems = this.mezclarConcursosPorPagina(concursos);
          this.allItems.push(...nuevosItems);
          this.actualizarEstadoPaginacion(concursos);
          this.loadNextGroup();
        } else {
          this.hasMoreConcursos = false;
        }
      },
      error: err => {
        this.loading = false;
        this.hasMoreConcursos = false;
      }
    });
  }

  private mezclarConcursosYFotos(): ItemConcursoOFoto[] {
    const itemsMezclados: ItemConcursoOFoto[] = [];
    
    const concursosPorAnio: Map<number, Contest[]> = new Map();
    
    this.concursos.forEach(concurso => {
      const anio = concurso.end_date ? new Date(concurso.end_date).getFullYear() : 0;
      if (!concursosPorAnio.has(anio)) {
        concursosPorAnio.set(anio, []);
      }
      concursosPorAnio.get(anio)!.push(concurso);
    });
    
    const aniosConcursos = Array.from(concursosPorAnio.keys());
    const aniosFotos = Array.from(this.fotosDelAnioPorTemporada.keys());
    const todosLosAnios = [...new Set([...aniosConcursos, ...aniosFotos])];
    
    const anios = todosLosAnios.sort((a, b) => b - a);
    
    anios.forEach(anio => {
      if (this.fotosDelAnioPorTemporada.has(anio)) {
        const fotosData = this.fotosDelAnioPorTemporada.get(anio)!;
        itemsMezclados.push({
          tipo: 'fotos-anio',
          fotosAnio: fotosData.items,
          temporada: fotosData.temporada,
          url_grabacion: fotosData.url_grabacion
        });
      }
      
      const concursosDelAnio = concursosPorAnio.get(anio) || [];
      concursosDelAnio.sort((a, b) => {
        const fechaA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const fechaB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return fechaB - fechaA;
      });
      
      concursosDelAnio.forEach(concurso => {
        itemsMezclados.push({
          tipo: 'concurso',
          concurso: concurso
        });
      });
    });
    
    return itemsMezclados;
  }

  private mezclarConcursosPorPagina(concursos: Contest[]): ItemConcursoOFoto[] {
    const items: ItemConcursoOFoto[] = [];
    const concursosPorAnio: Map<number, Contest[]> = new Map();

    concursos.forEach(concurso => {
      const anio = concurso.end_date ? new Date(concurso.end_date).getFullYear() : 0;
      if (!concursosPorAnio.has(anio)) {
        concursosPorAnio.set(anio, []);
      }
      concursosPorAnio.get(anio)!.push(concurso);
    });

    const aniosConcursos = Array.from(concursosPorAnio.keys()).sort((a, b) => b - a);

    aniosConcursos.forEach(anio => {
      const fotosData = this.fotosDelAnioPorTemporada.get(anio);
      const fotosYaMostradas = this.itemGroups.some(
        group => group.some(item => item.tipo === 'fotos-anio' && item.temporada === anio)
      ) || this.allItems.some(
        item => item.tipo === 'fotos-anio' && item.temporada === anio
      );
      if (fotosData && !fotosYaMostradas) {
        items.push({
          tipo: 'fotos-anio',
          fotosAnio: fotosData.items,
          temporada: fotosData.temporada,
          url_grabacion: fotosData.url_grabacion
        });
      }

      const concursosDelAnio = concursosPorAnio.get(anio) || [];
      concursosDelAnio.sort((a, b) => {
        const fechaA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const fechaB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return fechaB - fechaA;
      });

      concursosDelAnio.forEach(concurso => {
        items.push({
          tipo: 'concurso',
          concurso: concurso
        });
      });
    });

    return items;
  }

  private procesarFotosDelAnio(fotosAnio: any) {
    this.fotosDelAnioPorTemporada.clear();
    const fotosArray = Array.isArray(fotosAnio) ? fotosAnio : [fotosAnio];

    fotosArray.forEach((fotoData: any) => {
      if (fotoData && fotoData.temporada && fotoData.items && fotoData.items.length > 0) {
        fotoData.items.sort((a: any, b: any) => a.orden - b.orden);
        this.fotosDelAnioPorTemporada.set(fotoData.temporada, fotoData);
      }
    });
  }

  private cargarFotosDelAnio() {
    const url = `${this.configService.nodeApiBaseUrl}foto-del-anio`;
    this.http.get<any>(url).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: data => {
        this.procesarFotosDelAnio(data);
        if (this.concursos.length > 0) {
          this.reconstruirItems();
        }
      },
      error: () => {}
    });
  }

  private reconstruirItems() {
    const concursos = [...this.concursos];
    this.concursos.length = 0;
    this.allItems = [];
    this.itemGroups = [];
    for (let i = 0; i < concursos.length; i += this.concursoPageSize) {
      const page = concursos.slice(i, i + this.concursoPageSize);
      this.concursos.push(...page);
      const nuevosItems = this.mezclarConcursosPorPagina(page);
      this.allItems.push(...nuevosItems);
    }
    while (this.allItems.length > 0) {
      const group = this.allItems.splice(0, this.itemsChunkSize);
      this.itemGroups.push(group);
    }
  }

  private actualizarEstadoPaginacion(concursos: Contest[]) {
    const meta: any = this.contestService.getAllMeta();
    if (meta && typeof meta.currentPage !== 'undefined' && typeof meta.pageCount !== 'undefined') {
      this.hasMoreConcursos = meta.currentPage < meta.pageCount;
    } else {
      this.hasMoreConcursos = concursos.length === this.concursoPageSize;
    }
  }

  private loadNextGroup(): number {
    if (this.allItems.length === 0) {
      return 0;
    }
    const nextGroup = this.allItems.splice(0, this.itemsChunkSize);
    this.itemGroups.push(nextGroup);
    return nextGroup.length;
  }

  trackByItem(index: number, item: ItemConcursoOFoto): string {
    if (item.tipo === 'concurso' && item.concurso?.id != null) {
      return `concurso-${item.concurso.id}`;
    }
    if (item.tipo === 'fotos-anio' && item.temporada != null) {
      return `fotos-anio-${item.temporada}`;
    }
    return `${item.tipo}-${index}`;
  }

  loadMoreConcursos(event?: any) {
    if (this.loadingMore || this.loading) {
      return;
    }

    this.loadingMore = true;

    if (this.allItems.length > 0) {
      this.loadNextGroup();
      if (!this.hasMoreConcursos && this.allItems.length === 0) {
        // no more items
      }
      this.loadingMore = false;
      return;
    }

    if (!this.hasMoreConcursos) {
      this.loadingMore = false;
      return;
    }

    this.concursoPage += 1;
    const pageParams = this.getPageParams(this.concursoPage);

    this.contestService.getAll(pageParams).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: concursos => {
        if (concursos && concursos.length > 0) {
          this.concursos.push(...concursos);
          const nuevosItems = this.mezclarConcursosPorPagina(concursos);
          this.allItems.push(...nuevosItems);
          this.actualizarEstadoPaginacion(concursos);
          this.loadNextGroup();
        } else {
          this.hasMoreConcursos = false;
        }
        this.loadingMore = false;
      },
      error: () => {
        this.hasMoreConcursos = false;
        this.loadingMore = false;
      }
    });
  }

  
  errorImg(e: any) {
    e.currentTarget.src='../../../assets/no-pictures.png';
    e.currentTarget.style='width: 25%; height: 25%; object-fit: contain;';
    e.currentTarget.parentNode.style= 'display: flex; align-items: center; justify-content: center;';
  }

  // popover
  async openPopover( ev:any, ctrl: any, url: string ){
    if (window.innerWidth > 767) {
      await this.UIUtilsService.mostrarModal(ctrl);
    }
    else {
      this.router.navigate([url]);
    }
  }
  async mostrarPerfil( ev:any ){
    this.openPopover(ev, UsuarioPage, '/perfil');
  }
  async mostrarNotificaciones( ev:any ) {
    this.openPopover(ev, NotificacionesPage, '/notificaciones');
  }
}
