import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { Metric } from 'src/app/models/metric.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';
import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { ConcursoDetailService } from '../concurso-detail.service';
import { VerFotografiasComponent } from '../ver-fotografias/ver-fotografias.component';
import { get_all, resultadosConcursoGeted } from '../../../services/contest-results.service'

@Component({
  selector: 'app-fotografias',
  templateUrl: './fotografias.component.html',
  styleUrls: ['./fotografias.component.scss'],
})
export class FotografiasComponent implements OnInit, AfterViewInit, OnDestroy {

  concurso: any = null;
  imagenCargada: boolean[] = [];
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  seccionesInscriptas: ContestSectionExpanded[] = [];
  resultadosObtenidos: ContestResultExpanded[] = [];
  colaImagenes: ContestResultExpanded[] = [];
  procesandoCola: boolean = false;
  resultadosFiltrados: ContestResultExpanded[] = [];
  fotoclubs: Fotoclub[] = [];
  user: UserLogged;

  public atributosBusqueda: SearchBarComponentAtributo[] = [
    {
      valor: 'title',
      valorMostrado: 'Título',
      callback: (c: ContestResultExpanded, query: string) => c.image.title.match(new RegExp(`${query}`, 'i'))
    },
    {
      valor: 'code',
      valorMostrado: 'Código',
      callback: (c: ContestResultExpanded, query: string) => c.image.code.match(new RegExp(`${query}`, 'i'))
    },
    {
      valor: 'fotoclub',
      valorMostrado: 'Fotoclub',
      callback: (c: ContestResultExpanded, query: string) => {
        const fotoclubName = this.getFotoclubName(c.image.profile_id);
        return fotoclubName.toLowerCase().includes(query.toLowerCase());
      }
    },
    {
      valor: 'seccion',
      valorMostrado: 'Sección',
      callback: (c: ContestResultExpanded, query: string) => c.section?.name.toLowerCase().includes(query.toLowerCase())
    },
    {
      valor: 'categoria',
      valorMostrado: 'Categoría',
      callback: (c: ContestResultExpanded, query: string) => {
        const inscripto = this.inscriptos.find(i => i.profile_id == c.image.profile_id);
        if (inscripto) {
          const categoria = this.categoriasInscriptas.find(cat => cat.category_id === inscripto.category_id);
          return categoria?.category?.name.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      }
    }
  ];
  public filtrado: any[] = [];
  puntajes: Metric[] = [];

  public seccionSeleccionada: Section = null;
  public categoriaSeleccionada: Category = null;
  public fotoclubSeleccionado: string = null;
  public updatingInscriptos: boolean = false;
  mostrarFiltro: boolean = false;
  public subscriptions = []

  paginaActual: number = 1;
  perPage: number = 20;
  loadingScroll: boolean = false;
  @ViewChild('scrollContainer') scrollContainer: ElementRef;
  scrollListener: any;
  noMoreResults: boolean = false;

  constructor(
    public concursoDetailService: ConcursoDetailService,
    public contestService: ContestService,
    public UIUtilsService: UiUtilsService,
    private route: ActivatedRoute,
    private configService: ConfigService,
    public rolificador: RolificadorService,
    public auth: AuthService,
  ) {
    this.filtrado['metric'] = {
      options: {
        valueProp: 'score',
        titleProp: 'prize',
        queryParam: 'score'
      },
      filterCallback: (c: ContestResultExpanded, atributoValue: string) => {
        return c.metric.score == parseInt(atributoValue)
      }
    }

    this.filtrado['perfil'] = {
      options: {
        valueProp: 'id',
        titleProp: (p: Profile) => `${(p.name)[0].toUpperCase()}${p.name.substr(1)} ${(p.last_name)[0].toUpperCase()}${p.last_name.substr(1)}`,
        queryParam: 'concursante_id'
      },
      filterCallback: (c: ContestResultExpanded, atributoValue: string) => {
        return c.image.profile_id == parseInt(atributoValue)
      }
    }

    this.subscribes()
  }
  get isContestNotFin() {
    let finalizado = (new Date()).getTime() >= (new Date(this.concurso.end_date)).getTime()
    return !(finalizado && this.concurso.judged)
  }

  get aspecto() {
    return document.body.classList.contains("dark")
  }

  isLogedIn() { //agregado para seguir manteniendo el servicio auth como private
    return this.auth.loggedIn;
  }

  setResultadosConcurso(rs) {
    // Deshabilitado: solo actualiza los resultados obtenidos y filtrados
    this.resultadosObtenidos = rs;
    this.resultadosFiltrados = [...rs];
  }

  // Reiniciar paginación y resultados solo al cargar o cambiar filtros
  async reloadFotografias() {
    this.paginaActual = 1;
    let params_: any = {
      ...this.route.snapshot.params,
      contest_id: this.concurso.id,
      page: this.paginaActual,
      'per-page': this.perPage
    };
    const data: any = await get_all(params_, true);
    this.resultadosObtenidos = (data && Array.isArray(data.items)) ? data.items : [];
    this.resultadosFiltrados = [...this.resultadosObtenidos]; // Sin filtros
  }

  subscribes() {
    this.subscriptions.push(this.concursoDetailService.categoriasInscriptas.subscribe(cs => this.categoriasInscriptas = cs))
    this.subscriptions.push(this.concursoDetailService.seccionesInscriptas.subscribe(cs => this.seccionesInscriptas = cs))
    this.subscriptions.push(this.concursoDetailService.concursantes.subscribe(
      cs => { this.concursantes = cs; }
    ))
    this.subscriptions.push(this.concursoDetailService.inscriptos.subscribe(cs =>{
      this.updatingInscriptos = true
      this.inscriptos = cs
      setTimeout(() => this.updatingInscriptos = false)
    }))
    this.subscriptions.push(resultadosConcursoGeted.subscribe(cs =>{
      // No reiniciar resultados aquí, solo en reloadFotografias
      // this.setResultadosConcurso(cs?.items)
    }))

    if (this.concurso === null)
      this.subscriptions.push(this.concursoDetailService.concurso.subscribe(async c => {
        this.concurso = c
        await this.reloadFotografias();
      }))
  }

  unsuscribes() {
    for (let i = 0; i < this.subscriptions.length; i++) {
      this.subscriptions[i].unsubscribe()
    }
    this.subscriptions = []
  }

  async ngOnInit() {
    if (this.rolificador.isAdmin(await this.auth.user) || this.isContestNotFin) {
      this.atributosBusqueda.push({
        valor: 'username',
        valorMostrado: 'Autor',
        callback: (c: ContestResultExpanded, query: string) => `${c.image.profile.name} ${c.image.profile.last_name}`.match(new RegExp(`${query}`, 'i'))
      })
    }

    this.auth.user.then(u => this.user = u);
  }

  ngAfterViewInit() {
    this.scrollListener = () => {
      const el = this.scrollContainer?.nativeElement;
      if (!el || this.loadingScroll || this.noMoreResults) return;
      const threshold = 300; // px antes del final
      console.log('Scroll event fired', {
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight
      });
      if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
        this.loadMoreNative();
      }
    };
    this.scrollContainer?.nativeElement.addEventListener('scroll', this.scrollListener);
    // Disparar carga si el contenido inicial no permite scroll
    setTimeout(() => {
      const el = this.scrollContainer?.nativeElement;
      if (el && el.scrollHeight <= el.clientHeight && !this.loadingScroll && !this.noMoreResults) {
        this.loadMoreNative();
      }
    }, 500);
  }

  async ngOnDestroy() {
    if (this.scrollContainer?.nativeElement && this.scrollListener) {
      this.scrollContainer.nativeElement.removeEventListener('scroll', this.scrollListener);
    }
    this.unsuscribes()
  }

  set_categoria_null() {
    this.categoriaSeleccionada = null;
  }

  set_seccion_null() {
    this.seccionSeleccionada = null;
  }

  set_fotoclub_null() {
    this.fotoclubSeleccionado = null;
  }

  async limpiarTodosLosFiltros() {
    this.categoriaSeleccionada = null;
    this.seccionSeleccionada = null;
    this.fotoclubSeleccionado = null;
    await this.reloadFotografias();
  }

  //botones de acciones disponibles para cada elemento listado (mobile, menu hamburguesa)
  can_delete(r: any) {
    console.log(r)
    const ES_MIA = r['image'].profile_id == this.user?.profile_id
    return ES_MIA && this.concurso.active
  }

  can_edit(r: any) {
    const ES_MIA = r['image'].profile_id == this.user?.profile_id
    return ES_MIA && this.concurso.active
  }


  async mostrarAcciones(ev: any, r: ContestResultExpanded, index: any) {
    const image = r.image
    const acciones = [
      {
        accion: (params: []) => this.openImage(index),
        // accion: (params: []) => this.reviewImage(r),
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
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones
      },
      cssClass: 'auto-width',
      event: ev,
      translucent: true,
      // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    }

    this.concursoDetailService.mostrarAcciones.emit(options)
  }

  //Funciones de ordenamiento para los app-th-sort

  ordenarPorAutor(e1: ContestResultExpanded, e2: ContestResultExpanded, creciente: boolean) {
    const n1 = e1.image.profile.last_name
    const n2 = e2.image.profile.last_name
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) :
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }

  ordenarPorObra(e1: ContestResultExpanded, e2: ContestResultExpanded, creciente: boolean) {
    const n1 = e1.image.title
    const n2 = e2.image.title
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) :
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }

  ordenarPorPremio(e1: ContestResultExpanded, e2: ContestResultExpanded, creciente: boolean) {
    const n1 = e1.metric.score
    const n2 = e2.metric.score
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) :
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }

  async loadMoreNative() {
    if (this.loadingScroll || this.noMoreResults) return;
    this.loadingScroll = true;
    let nextPage = this.paginaActual + 1;
    let params_: any = {
      ...this.route.snapshot.params,
      contest_id: this.concurso.id,
      page: nextPage,
      'per-page': this.perPage
    };
    try {
      const data: any = await get_all(params_, true);
      if (data && Array.isArray(data.items) && data.items.length) {
        // Guardar las nuevas imágenes en la cola temporal
        this.colaImagenes = [...this.colaImagenes, ...data.items];
        this.paginaActual = nextPage;
        if (data._meta && data._meta.currentPage >= data._meta.pageCount) {
          this.noMoreResults = true;
        }
        // Iniciar el procesamiento de la cola si no está en curso
        if (!this.procesandoCola) {
          this.procesarColaImagenes();
        }
      } else {
        this.noMoreResults = true;
      }
    } catch (error) {
      this.noMoreResults = false;
    }
    this.loadingScroll = false;
  }

  procesarColaImagenes() {
    this.procesandoCola = true;
    const procesar = () => {
      if (this.colaImagenes.length > 0) {
        const imagen = this.colaImagenes.shift();
        const thumbObj = imagen.image && imagen.image.thumbnail ? imagen.image.thumbnail : null;
        const url = this.getThumbUrl(thumbObj, 1);
        if (url) {
          const img = new window.Image();
          img.src = url;
          img.onload = () => {
            this.resultadosObtenidos.push(imagen);
            this.imagenCargada.push(false);
            setTimeout(() => {
              // En el siguiente tick, activar el fade-in
              const idx = this.resultadosObtenidos.length - 1;
              this.imagenCargada[idx] = true;
              setTimeout(procesar, 100);
            }, 0);
          };
          img.onerror = () => {
            this.resultadosObtenidos.push(imagen);
            this.imagenCargada.push(false);
            setTimeout(() => {
              const idx = this.resultadosObtenidos.length - 1;
              this.imagenCargada[idx] = true;
              setTimeout(procesar, 100);
            }, 0);
          };
        } else {
          this.resultadosObtenidos.push(imagen);
          this.imagenCargada.push(false);
          setTimeout(() => {
            const idx = this.resultadosObtenidos.length - 1;
            this.imagenCargada[idx] = true;
            setTimeout(procesar, 100);
          }, 0);
        }
      } else {
        this.procesandoCola = false;
      }
    };
    procesar();
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

  openImage(index: any) {
    this.UIUtilsService.mostrarModal(VerFotografiasComponent, { index, all_data: this.resultadosConcursoFiltrados, open: this.isContestNotFin }, true);
  }

  checkPermissions(reg: any) {
    return this.contestService.isActive(this.concurso) &&
      (this.user != undefined ? (this.rolificador.esDelegado(this.user) || this.rolificador.isAdmin(this.user) || (this.rolificador.esConcursante(this.user) && reg?.image?.profile_id == this.user.profile_id)) : false)
  }

  postImage(image: Image = undefined, section_id: number = undefined) {
    if (section_id == undefined) {
      section_id = this.seccionSeleccionada != null ? this.seccionSeleccionada.id : undefined
    }
    let section_max = this.concurso.max_img_section
  let resultados = this.resultadosObtenidos;

    this.concursoDetailService.postImage.emit({
      image,
      section_id,
      section_max,
      resultados
    });
  }

  // Los filtros están deshabilitados, se muestra directamente el arreglo
  get resultadosConcursoFiltrados() {
    // Los filtros están deshabilitados, siempre retorna los resultados obtenidos
    return this.resultadosObtenidos;
  }

  getThumbUrl(obj: any, thumb_id: number = 1) {
    //si no tiene miniatura porque no tiene imagen
    if (obj == null) {
      return '';
    }
    //si llega un objeto no iterable
    if (obj !== undefined && (obj.length === undefined || obj.length == 0)) {
      return this.configService.imageUrl(obj.url);
    }
    //si se trata de un arreglo
    for (let c = 0; c < obj.length; c++) {
      if (obj[c].thumbnail_type == thumb_id) {
        return this.configService.imageUrl(obj[c].url);
      }
    }
    return '';
  }

  getFullName(profile_id: number) {
    const p = this.inscriptos.find(p => p.profile_id == profile_id)
    return p != undefined ? `${p.profile.name} ${p.profile.last_name}` : ''
  }
}
