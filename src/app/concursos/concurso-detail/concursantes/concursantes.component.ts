import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonGrid } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';
import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { MenuAccionesComponent, MenuAccionesComponentAccion } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { ConcursoDetailService } from '../concurso-detail.service';

@Component({
  selector: 'app-concursantes',
  templateUrl: './concursantes.component.html',
  styleUrls: ['./concursantes.component.scss'],
  // providers: [ ConcursoDetailService ]
})
export class ConcursantesComponent implements OnInit {

  @ViewChild('concursantesContent') content: HTMLElement
  // @Input() concursantes: ProfileExpanded[];
  // @Input() resultadosConcurso: ContestResultExpanded[];
  // @Input() fotoclubs: Fotoclub[];
  concurso: Contest = this.contestService.template;
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  resultadosConcurso: ContestResultExpanded[] = [];
  // fotoclubs: Fotoclub[];
  mostrarFiltro: boolean = false
  // public loading: boolean = true
  public categoriaSeleccionada: Category = null;
  user: UserLogged

  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'nombre', 
      valorMostrado: 'Nombre', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.title.toLowerCase().includes(query.toLowerCase())      
      callback: (p: ProfileContestExpanded, query: string) => p.profile.name.match(new RegExp(`^${query}`, 'i'))
    },
    { 
      valor: 'apellido', 
      valorMostrado: 'Apellido', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.code.toLowerCase().includes(query.toLowerCase()) 
      callback: (p: ProfileContestExpanded, query: string) => p.profile.last_name.match(new RegExp(`^${query}`, 'i'))
    }
  ];

  // @Output() openPopup = new EventEmitter<any>();
  // @Output() postImage = new EventEmitter<Image|undefined>();
  // @Output() reviewImage = new EventEmitter<ContestResultExpanded>();
  // @Output() deleteImage = new EventEmitter<ContestResultExpanded>();


  constructor(
    public concursoDetailService: ConcursoDetailService,
    public rolificador: RolificadorService,
    public auth: AuthService,
    public contestService: ContestService,
    public UIUtilsService: UiUtilsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ionViewDidEnter() {

  }

  get isAdmin() {
    return (this.user != undefined ? this.rolificador.isAdmin(this.user) : false)
  }

  async ngOnInit() {
    if (this.concurso.id == undefined) {
      await this.UIUtilsService.presentLoading()
    }
    this.concursoDetailService.concursantes.subscribe(cs => this.concursantes = cs)
    this.concursoDetailService.inscriptos.subscribe(is => {
      this.inscriptos = is
      this.UIUtilsService.dismissLoading()
      setTimeout(() => {
        // console.log(this.content)
        
        // let concursantesContent = document.querySelector('#concursantesContent') as HTMLElement
        // let content = document.querySelector('#concurso-content') as HTMLElement
        // // let content = this.content
        // console.log(content)
        // content.style.setProperty('height', '')
        // // content.style.height = ''
        // const height = content.getBoundingClientRect().height
        // const height2 = concursantesContent.getBoundingClientRect().height
        // // console.log('tabs content height', height)
        // content.style.setProperty('height', `${height + height2 + 500}px`) 
        // // content.style.height = `${height + 500}px`
  
      }, 500)
    })
    this.concursoDetailService.categoriasInscriptas.subscribe(cs => this.categoriasInscriptas = cs)
    this.concursoDetailService.concurso.subscribe(c => this.concurso = c)
    this.concursoDetailService.resultadosConcurso.subscribe(rs => 
      this.resultadosConcurso = rs 
    )
    this.auth.user.then(u => this.user = u)
    
    // this.concursoDetailService.loadConcursantes()
    // this.concursoDetailService.loadProfileContests()
  }

  get inscriptosFiltrados() {
    return this.inscriptos.filter(i => {
      let cond1: boolean = true;
      if (this.categoriaSeleccionada != undefined) {
        // console.log(this.categoriaSeleccionada, 'categoria')
        cond1 = this.categoriaSeleccionada.id == i.category_id
      }
      return cond1
    })
  }

  getFotosCargadas(profile_id: number) {
    return this.resultadosConcurso.filter(cr => cr.image.profile_id == profile_id).length
  }

  getFotoclubName(profile_id: number): string {
    const profile = this.inscriptos.find(p => p.profile_id == profile_id)
    return profile != undefined ? profile.profile.fotoclub.name : ''
  }

  getFullName(profile_id: number) {
    const p = this.inscriptos.find(p => p.profile_id == profile_id)
    return p != undefined ? `${p.profile.name} ${p.profile.last_name}` : ''
  }


  ordenarPorApellido(e1: ProfileContestExpanded, e2: ProfileContestExpanded, creciente: boolean) {
    const n1 = e1.profile.last_name
    const n2 = e2.profile.last_name;
    
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }
  ordenarPorFotoclub(e1: ProfileContestExpanded, e2: ProfileContestExpanded, creciente: boolean) {
    const n1 = e1.profile.fotoclub.name
    const n2 = e2.profile.fotoclub.name
    
    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }

inscribirConcursante() {
  // this.concursoDetailService.inscribirConcursante.emit(this.categoriaSeleccionada ? this.categoriaSeleccionada.id : undefined)
  this.concursoDetailService.inscribirConcursante(this.categoriaSeleccionada ? this.categoriaSeleccionada.id : undefined)
}

postImage(profile_id: number) {
  this.concursoDetailService.postImage.emit({
    image: {
      id: undefined,
      profile_id,
      code: undefined,
      title: undefined
    }
  })
}

  async mostrarAcciones(ev: any, p: ProfileContestExpanded) {
    // const options = {
    //   component: MenuAccionesComponent, //componente a mostrar
    //   componentProps: {
    //     acciones: [
    //       // {
    //       //   accion: (params: []) => this.concursoDetailService.reviewImage.emit(r),
    //       //   // accion: (params: []) => this.reviewImage(r),
    //       //   params: [],
    //       //   icon: 'star-outline',
    //       //   label: 'Puntuar'
    //       // },
    //       {
    //         accion: (params: []) => this.router.navigate(['../fotografias'], { queryParams: {concursante_id: p.profile_id}, relativeTo: this.activatedRoute}),
    //         // accion: (params: []) => this.postImage(i),
    //         params: [],
    //         icon: 'images-outline',
    //         label: 'Ver fotografías'
    //       },
    //       {
    //         accion: (params: []) => this.postImage(p.profile_id),
    //         // accion: (params: []) => this.postImage(i),
    //         params: [],
    //         icon: 'camera-outline',
    //         label: 'Agregar fotografía'
    //       },
    //       {
    //         accion: (params: number[]) => this.concursoDetailService.desinscribirConcursante.emit(p),
    //         // accion: (params: number[]) => this.deleteImage(r.image_id, r.id, r.metric_id),
    //         params: [],
    //         icon: 'trash',
    //         label: 'Desinscribir'
    //       }
    //     ]
    //   },
    //   cssClass: 'auto-width',
    //   event: ev,
    //   translucent: true,
    //   // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    // }

    // this.openPopup.emit(options)
    // this.concursoDetailService.mostrarAcciones.emit(options)
    const acciones: MenuAccionesComponentAccion[] = [
      {
        accion: (params: []) => this.router.navigate(['../fotografias'], { queryParams: {concursante_id: p.profile_id}, relativeTo: this.activatedRoute}),
        // accion: (params: []) => this.postImage(i),
        params: [],
        icon: 'images-outline',
        label: 'Ver fotografías'
      }
    ]
    if (this.contestService.isActive(this.concurso)) {
      acciones.push(
        {
          accion: (params: []) => this.postImage(p.profile_id),
          // accion: (params: []) => this.postImage(i),
          params: [],
          icon: 'camera-outline',
          label: 'Agregar fotografía'
        },
        {
          accion: (params: number[]) => this.concursoDetailService.desinscribirConcursante.emit(p),
          // accion: (params: number[]) => this.deleteImage(r.image_id, r.id, r.metric_id),
          params: [],
          icon: 'trash',
          label: 'Desinscribir'
        }
      )
    }
    this.UIUtilsService.mostrarMenuAcciones(acciones, ev)
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
