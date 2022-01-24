import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

@Component({
  selector: 'app-fotografias',
  templateUrl: './fotografias.component.html',
  styleUrls: ['./fotografias.component.scss'],
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
  user: UserLogged;
  public cont: number = 0;
  public cont2: number = 0;

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
    },
  ];
  public filtrado: any[] = [];
  puntajes: Metric[]= [];

  public seccionSeleccionada: Section = null;
  public categoriaSeleccionada: Category = null;
  public updatingInscriptos: boolean = false;
  mostrarFiltro: boolean = false;

  constructor(
    public concursoDetailService: ConcursoDetailService,
    public contestService: ContestService,
    public UIUtilsService: UiUtilsService,
    private route: ActivatedRoute,
    private router: Router,
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
  }
  get isContestNotFin() {
    return this.concurso.active
  }

  get aspecto() {
    return document.body.classList.contains("dark")
   }
  
  isLogedIn(){ //agregado para seguir manteniendo el servicio auth como private
    return this.auth.loggedIn;
  }

   
  ionViewWillEnter() {
  }

  async ngOnInit() {
    if (this.rolificador.isAdmin(await this.auth.user) || this.isContestNotFin ) {
        this.atributosBusqueda.push({ 
        valor: 'username', 
        valorMostrado: 'Autor',  
        callback: (c: ContestResultExpanded, query: string) => `${c.image.profile.name} ${c.image.profile.last_name}`.match(new RegExp(`${query}`, 'i'))
      })
    }

    this.auth.user.then(u => this.user = u)
    // let loading: HTMLIonLoadingElement;
    if (this.concurso.id == undefined) {
      // await this.UIUtilsService.presentLoading()
    }
    
    this.concursoDetailService.concurso.subscribe(c => {
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
          // this.UIUtilsService.dismissLoading()
          this.route.queryParams.subscribe(params => {
      
            this.resultadosConcurso = [...this.resultadosConcursoOrig]
      
            this.resultadosConcurso.forEach( e => {
              if (e.metric.prize != '0' && e.metric.prize != null && e.metric.prize != undefined && e.metric.prize != '') {
                if(this.puntajes.find(element => element.score == e.metric.score ) == undefined){
                  this.puntajes.push(e.metric)
                }
              }
            })

            const filterCallbacks: {
              queryValue: string;
              callback: Function;
            }[] = [];
      
            for (const f of [this.filtrado['metric'], this.filtrado['perfil']]) {
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
   
  }

  getThumbUrl(obj:any, thumb_id:number = 1){
        //si no tiene miniatura porque no tiene imagen
    if (obj == null) {
      return '';
    }
    //si llega un objeto no iterable
    if (obj !== undefined && (obj.length === undefined || obj.length == 0)){
      return this.configService.apiUrl(obj.url);
    }
    //si se trata de un arreglo
    for(let c=0; c < obj.length; c++){
      if (obj[c].thumbnail_type == thumb_id){
        return this.configService.apiUrl(obj[c].url);
      }
    }
    return '';
  }

  get checkPermissions() {
    return this.contestService.isActive(this.concurso) && 
    (this.user != undefined ? (this.rolificador.esDelegado(this.user) || this.rolificador.isAdmin(this.user) || this.rolificador.esConcursante(this.user)  ) : false)
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
    //if (this.cont2 < 1) {
    //  this.cont2++
    if (section_id == undefined) {
      section_id = this.seccionSeleccionada != null ? this.seccionSeleccionada.id : undefined
  }
  let section_max = this.concurso.max_img_section
  let resultados = this.resultadosConcurso

  this.concursoDetailService.postImage.emit({
      image,
      section_id, 
      section_max,
      resultados
  });
   //   this.cont2 --
  //}
  }

  openImage(image: Image) {
    if (this.cont < 1) {
      this.cont++
    this.UIUtilsService.mostrarModal(VerFotografiasComponent, {image});
    this.cont --
    }
  }

  //botones de acciones disponibles para cada elemento listado (mobile, menu hamburguesa)

  async mostrarAcciones(ev: any, r: ContestResultExpanded) {
    const image = r.image
    const acciones = [
      {
        accion: (params: []) => this.openImage(image),
        // accion: (params: []) => this.reviewImage(r),
        params: [],
        icon: 'image-outline',
        label: 'Ver'
      }
    ]
    if (this.checkPermissions) {
      acciones.push(
        {
          accion: (params: []) => this.concursoDetailService.reviewImage.emit(r),
          params: [],
          icon: 'star-outline',
          label: 'Puntuar'
        },
        {
          accion: (params: []) => this.postImage(image, r.section_id),
          params: [],
          icon: 'create',
          label: 'Editar'
        },
        {
          accion: (params: number[]) => this.concursoDetailService.deleteImage.emit(r),
          params: [],
          icon: 'trash',
          label: 'Borrar'
        }
      )
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

    // this.openPopup.emit(options)
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
}
