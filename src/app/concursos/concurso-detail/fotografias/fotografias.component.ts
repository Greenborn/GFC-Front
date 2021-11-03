import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestResult, ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { Metric } from 'src/app/models/metric.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { ConcursoDetailService } from '../concurso-detail.service';
import { ImagePostParams, ImagePostPage } from '../image-post/image-post.page';

@Component({
  selector: 'app-fotografias',
  templateUrl: './fotografias.component.html',
  styleUrls: ['./fotografias.component.scss'],
  // providers: [ConcursoDetailService]
})
export class FotografiasComponent implements OnInit {

  
  concurso: Contest = this.contestService.template;
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  seccionesInscriptas: ContestSectionExpanded[] = [];
  resultadosConcurso: ContestResultExpanded[] = [];
  resultadosConcursoOrig: ContestResultExpanded[] = [];
  fotoclubs: Fotoclub[] = [];

  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'title', 
      valorMostrado: 'Título', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.title.toLowerCase().includes(query.toLowerCase())      
      callback: (c: ContestResultExpanded, query: string) => c.image.title.match(new RegExp(`${query}`, 'i'))
    },
    { 
      valor: 'code', 
      valorMostrado: 'Código', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.code.toLowerCase().includes(query.toLowerCase()) 
      callback: (c: ContestResultExpanded, query: string) => c.image.code.match(new RegExp(`${query}`, 'i'))
    }
  ];
  public filtrado: any[] = [];

  // @Output() openPopup = new EventEmitter<any>();
  // @Output() postImage = new EventEmitter<Image|undefined>();
  // @Output() reviewImage = new EventEmitter<ContestResultExpanded>();
  // @Output() deleteImage = new EventEmitter<ContestResultExpanded>();

  public seccionSeleccionada: Section = null;
  public categoriaSeleccionada: Category = null;
  // public loading: boolean = true;
  public updatingInscriptos: boolean = false;
  mostrarFiltro: boolean = false;
  constructor(
    public concursoDetailService: ConcursoDetailService,
    public contestService: ContestService,
    public UIUtilsService: UiUtilsService,
    private route: ActivatedRoute,
  ) { 
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
  }

  async ngOnInit() {
    // let loading: HTMLIonLoadingElement;
    if (this.concurso.id == undefined) {
      await this.UIUtilsService.presentLoading()
    }
    
    this.concursoDetailService.concurso.subscribe(c => {
      console.log('got contest', c)
      this.concurso = c
    })
    this.concursoDetailService.categoriasInscriptas.subscribe(cs => this.categoriasInscriptas = cs)
    this.concursoDetailService.seccionesInscriptas.subscribe(cs => this.seccionesInscriptas = cs)
    const s1 = this.concursoDetailService.concursantes.subscribe(
      cs => {
        this.concursantes = cs
        // s1.unsubscribe()
      }
    )
    const s2 = this.concursoDetailService.inscriptos.subscribe(cs =>{
      this.updatingInscriptos = true
      this.inscriptos = cs
      setTimeout(() => this.updatingInscriptos = false)
    })
    const s3 = this.concursoDetailService.resultadosConcurso.subscribe({
      next: rs => {
          this.resultadosConcurso = rs
          this.resultadosConcursoOrig = [...rs]
          this.UIUtilsService.dismissLoading()
          this.route.queryParams.subscribe(params => {

            // console.log('detecting query params change', params)
      
            this.resultadosConcurso = [...this.resultadosConcursoOrig]
      
            const filterCallbacks: {
              queryValue: string;
              callback: Function;
            }[] = [];
      
            for (const f of [this.filtrado['perfil']]) {
              // console.log('analizando filter callback', f)
              if (params[f.options.queryParam] != undefined) {
                // console.log('agregando filter callback', f.options.queryParam)
                filterCallbacks.push({
                  callback: f.filterCallback,
                  queryValue: params[f.options.queryParam]
                })
              }
            }
      
            for (const f of filterCallbacks) {
              this.resultadosConcurso = this.resultadosConcurso.filter(p => f.callback(p, f.queryValue))
            }
          });
          // this.loading = false
        }
      }
    )

    
    // this.concursoDetailService.loadConcursantes()
    // this.concursoDetailService.loadProfileContests()
    // this.concursoDetailService.loadContestResults()

    
  }

  get inscriptosProfiles(): Profile[] {
    const inscriptos = this.categoriaSeleccionada != null ? this.inscriptos.filter(i => i.category_id == this.categoriaSeleccionada.id) : this.inscriptos
    return inscriptos.map(i => i.profile)
  }
  get inscriptosEmptyMessage(): string {
    return 'No hay inscriptos'
  }

  get resultadosConcursoFiltrados() {
    return this.resultadosConcurso.filter(rc => {
      let cond1: boolean = true;
      if (this.categoriaSeleccionada != undefined) {
        // console.log(this.categoriaSeleccionada, 'categoria')
        cond1 = this.categoriaSeleccionada.id == this.inscriptos.find(i => i.profile_id == rc.image.profile_id).category_id
      }
      let cond2: boolean = true;
      if (this.seccionSeleccionada != undefined) {
        // console.log(this.seccionSeleccionada, 'seccion')
        cond2 = this.seccionSeleccionada.id == rc.section_id
      }
      return cond1 && cond2
    })
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  getFotoclubName(profile_id: number): string {
    const profile = this.inscriptos.find(p => p.profile_id == profile_id)
    return profile != undefined ? profile.profile.fotoclub.name : ''
  }

  getFullName(profile_id: number) {
    const p = this.inscriptos.find(p => p.profile_id == profile_id)
    return p != undefined ? `${p.profile.name} ${p.profile.last_name}` : ''
  }

  postImage(image: Image = undefined, section_id: number = undefined) {
    console.log('posting new img')
    if (section_id == undefined) {
      section_id = this.seccionSeleccionada != null ? this.seccionSeleccionada.id : undefined
    }
    this.concursoDetailService.postImage.emit({
      image,
      section_id
    })
  }

  async mostrarAcciones(ev: any, r: ContestResultExpanded) {
    const image = r.image
    const options = {
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones: [
          {
            accion: (params: []) => this.concursoDetailService.reviewImage.emit(r),
            // accion: (params: []) => this.reviewImage(r),
            params: [],
            icon: 'star-outline',
            label: 'Puntuar'
          },
          {
            accion: (params: []) => this.postImage(image),
            // accion: (params: []) => this.postImage(i),
            params: [],
            icon: 'create',
            label: 'Editar'
          },
          {
            accion: (params: number[]) => this.concursoDetailService.deleteImage.emit(r),
            // accion: (params: number[]) => this.deleteImage(r.image_id, r.id, r.metric_id),
            params: [],
            icon: 'trash',
            label: 'Borrar'
          }
        ]
      },
      cssClass: 'auto-width',
      event: ev,
      translucent: true,
      // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    }

    // this.openPopup.emit(options)
    this.concursoDetailService.mostrarAcciones.emit(options)
  }

  ordenarPorAutor(e1: ContestResultExpanded, e2: ContestResultExpanded, creciente: boolean) {
    const n1 = e1.image.profile.last_name
    const n2 = e2.image.profile.last_name
    // const n1 = this.inscriptos.find(i => e1.image.profile_id == i.profile_id).profile.last_name ?? ''
    // const n2 = this.inscriptos.find(i => e2.image.profile_id == i.profile_id).profile.last_name ?? ''
    
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }
  ordenarPorObra(e1: ContestResultExpanded, e2: ContestResultExpanded, creciente: boolean) {
    const n1 = e1.image.title
    const n2 = e2.image.title
    // const n1 = this.inscriptos.find(i => e1.image.profile_id == i.profile_id).profile.last_name ?? ''
    // const n2 = this.inscriptos.find(i => e2.image.profile_id == i.profile_id).profile.last_name ?? ''
    
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }


  ionViewWillEnter() {
    // if (this.concurso.id == undefined) {
    //   // console.log('hola')
    //   if (this.concursoDetailService.concursoObj != undefined) {
    //     this.concurso = this.concursoDetailService.concursoObj
    //   } else {
    //     setTimeout(() => {
    //       this.concurso = this.concursoDetailService.concursoObj
    //       // console.log('timeout concurso fetch', this.concurso)
    //     }, 1000)
    //   }
    // } else {
    //   console.log(this.concurso, this.contestService.template)
    // }
  }
}
