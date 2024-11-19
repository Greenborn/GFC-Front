import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';

import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';

import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestService } from 'src/app/services/contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { MenuAccionesComponentAccion } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { ConcursoDetailService } from '../concurso-detail.service';
import { resultadosConcursoGeted } from 'src/app/services/contest-results.service'

@Component({
  selector: 'app-concursantes',
  templateUrl: './concursantes.component.html',
  styleUrls: ['./concursantes.component.scss'],
})
export class ConcursantesComponent implements OnInit {

  @ViewChild('concursantesContent') content: HTMLElement;

  concurso: Contest = this.contestService.template;
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  categoriasInscriptas: ContestCategoryExpanded[] = [];
  resultadosConcurso: ContestResultExpanded[] = [];
  
  mostrarFiltro: boolean = false;
  public categoriaSeleccionada: Category = null;
  user: UserLogged

  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'nombre', 
      valorMostrado: 'Nombre',     
      callback: (p: ProfileContestExpanded, query: string) => p.profile.name.match(new RegExp(`^${query}`, 'i'))
    },
    { 
      valor: 'apellido', 
      valorMostrado: 'Apellido', 
      callback: (p: ProfileContestExpanded, query: string) => p.profile.last_name.match(new RegExp(`^${query}`, 'i'))
    }
  ];


  constructor(
    public concursoDetailService: ConcursoDetailService,
    public rolificador: RolificadorService,
    public auth: AuthService,
    public contestService: ContestService,
    public UIUtilsService: UiUtilsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public configService: ConfigService
  ) { }

  ionViewDidEnter() {

  }

  get isAdmin() {
    return (this.user != undefined ? this.rolificador.isAdmin(this.user) : false)
  }
  get checkPermissions() {
    return this.contestService.isActive(this.concurso) && 
      (this.user != undefined ? (this.rolificador.esDelegado(this.user) || (this.rolificador.isAdmin(this.user)) ): false)
  }

  
  async ngOnInit() {
    if (this.concurso.id == undefined) {
      await this.UIUtilsService.presentLoading()
    }
    this.auth.user.then(u => this.user = u)

    this.subscribes()
  }

  public subscriptions = []  
  subscribes(){
    this.subscriptions.push(this.concursoDetailService.concursantes.subscribe(cs => this.concursantes = cs))
    this.subscriptions.push(
      this.concursoDetailService.inscriptos.subscribe(is => {
        this.inscriptos = is
        this.UIUtilsService.dismissLoading()
        setTimeout(() => {
            
        }, 500)
      })
    )
    this.subscriptions.push(
      this.concursoDetailService.categoriasInscriptas.subscribe(cs => this.categoriasInscriptas = cs)
    )
    this.subscriptions.push(
      this.concursoDetailService.concurso.subscribe(c => this.concurso = c)
    )
    this.subscriptions.push(
      resultadosConcursoGeted.subscribe(rs => 
        this.resultadosConcurso = rs 
      )
    )
  }

  unsuscribes(){
    for (let i=0; i < this.subscriptions.length; i++){
      this.subscriptions[i].unsubscribe()
    }
    this.subscriptions = []
  }

  ngOnDestroy() {
    this.unsuscribes()
  }

  get inscriptosFiltrados() {
    return this.inscriptos.filter(i => {
      let cond1: boolean = true;
      if (this.categoriaSeleccionada != undefined) {
        cond1 = this.categoriaSeleccionada.id == i.category_id
      }
      return cond1
    })
  }

  isLogedIn(){ //agregado para seguir manteniendo el servicio auth como private
    return this.auth.loggedIn;
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
  this.concursoDetailService.inscribirConcursante(this.categoriaSeleccionada ? this.categoriaSeleccionada.id : undefined)
}

postImage(profile_id: number) {
  this.concursoDetailService.postImage.emit({
    image: {
      id: undefined,
      profile_id,
      url:'',
      code: undefined,
      title: undefined
    }
  })
}

  async mostrarAcciones(ev: any, p: ProfileContestExpanded) {
    
    const acciones: MenuAccionesComponentAccion[] = [
      {
        accion: (params: []) => this.router.navigate(['../fotografias'], { queryParams: {concursante_id: p.profile_id}, relativeTo: this.activatedRoute}),
        params: [],
        icon: 'images-outline',
        label: 'Ver fotografías'
      }
    ]
    if (this.contestService.isActive(this.concurso)) {
      acciones.push(
        {
          accion: (params: []) => this.postImage(p.profile_id),
          params: [],
          icon: 'camera-outline',
          label: 'Agregar fotografía'
        },
        {
          accion: (params: number[]) => this.concursoDetailService.desinscribir.emit(p),
          params: [],
          icon: 'trash',
          label: 'Desinscribir'
        }
      )
    }
    this.UIUtilsService.mostrarMenuAcciones(acciones, ev)
  }

  ionViewWillEnter() {
   
  }
}
