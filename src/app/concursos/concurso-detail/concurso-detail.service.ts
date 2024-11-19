import { EventEmitter, Injectable, OnInit } from '@angular/core';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { Image } from 'src/app/models/image.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Contest } from 'src/app/models/contest.model';
import { ContestCategoryExpanded } from 'src/app/models/contest_category.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { ImagePostParams } from './image-post/image-post.page';
import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { InscribirConcursanteComponent } from './inscribir-concursante/inscribir-concursante.component';
import { BehaviorSubject } from 'rxjs';
import { ContestService } from 'src/app/services/contest.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { filter, map } from 'rxjs/operators';
import { ContestResultService } from 'src/app/services/contest-result.service';
import { InscribirJuecesComponent } from './inscribir-jueces/inscribir-jueces.component';

@Injectable({
  providedIn: 'root'
})
export class ConcursoDetailService implements OnInit {

  
  public concurso: BehaviorSubject<Contest>;
  public concursantes: BehaviorSubject<ProfileExpanded[]>;
  public jueces: BehaviorSubject<ProfileExpanded[]>;
  public inscriptos: BehaviorSubject<ProfileContestExpanded[]>;
  public inscriptosJueces: BehaviorSubject<ProfileContestExpanded[]>;
  public categoriasInscriptas: BehaviorSubject<ContestCategoryExpanded[]>;
  public seccionesInscriptas: BehaviorSubject<ContestSectionExpanded[]>;
  public resultadosConcurso: BehaviorSubject<ContestResultExpanded[]>;
  public desinscribir: EventEmitter<ProfileContestExpanded>;
  public postImage: EventEmitter<ImagePostParams>;
  public reviewImage: EventEmitter<ContestResultExpanded>;
  public deleteImage: EventEmitter<ContestResultExpanded>;
  public mostrarAcciones: EventEmitter<any>;
  
  constructor(
    public UIUtilsService: UiUtilsService,
    private profileContestService: ProfileContestService,
    private contestService: ContestService,
    private contestResultService: ContestResultService,
    private rolificador: RolificadorService,
    private authService: AuthService
  ) { 

    this.concurso = new BehaviorSubject<Contest>(this.contestService.template);
    this.concursantes = new BehaviorSubject<ProfileExpanded[]>([]);
    this.jueces = new BehaviorSubject<ProfileExpanded[]>([]);
    this.inscriptos = new BehaviorSubject<ProfileContestExpanded[]>([]);
    this.inscriptosJueces = new BehaviorSubject<ProfileContestExpanded[]>([]);
    this.categoriasInscriptas = new BehaviorSubject<ContestCategoryExpanded[]>([]);
    this.seccionesInscriptas = new BehaviorSubject<ContestSectionExpanded[]>([]);
    this.resultadosConcurso = new BehaviorSubject<ContestResultExpanded[]>([]);
    this.desinscribir = new EventEmitter<ProfileContestExpanded>();
    this.postImage = new EventEmitter<ImagePostParams>();
    this.reviewImage = new EventEmitter<ContestResultExpanded>();
    this.deleteImage = new EventEmitter<ContestResultExpanded>();
    this.mostrarAcciones = new EventEmitter<any>();
    
    
    this.loadConcursantes()
    this.loadJueces()
    this.loadProfileContests()
    this.loadProfileContestsJueces()
  }

  ngOnInit() {
  }

  loadContest(id: number): Promise<void> {
    const all: Promise<void>[] = []

    all.push(new Promise(resolve => {
      const s = this.contestService.get(id, 'expand=countContestResults,countProfileContests,contestRecords').subscribe(c => {
        console.log('got', c, id)
        this.concurso.next(c)
        s.unsubscribe()
        resolve()
      })
    }))
    all.push(new Promise(resolve => {

      const s = this.contestService.getCategoriasInscriptas(id).subscribe(ci => {
        this.categoriasInscriptas.next(ci)
        s.unsubscribe()
        resolve()
      })
    }))

    all.push(new Promise(resolve => {
      const s = this.contestService.getSeccionesInscriptas(id).subscribe(si => {
        this.seccionesInscriptas.next(si)
        s.unsubscribe()
        resolve()
      })
    }))

    return new Promise(resolve => Promise.all(all).then(() => resolve()))
  }

  async loadProfileContests() {
    const u = await this.authService.user
    this.concurso.pipe(
      filter(c => c.id != undefined)
    ).subscribe(c => {
      // const s = this.rolificador.getConcursantesInscriptos(u, c.id).subscribe(is => {
      const s = this.profileContestService.getAll<ProfileContestExpanded>(`expand=profile,profile.user,profile.fotoclub&filter[contest_id]=${c.id}`).subscribe(is => {
        // console.log('updated inscriptos', is)
        this.inscriptos.next(is)
        s.unsubscribe()
      })
    })
  }
  async loadProfileContestsJueces() {
    const u = await this.authService.user
    this.concurso.pipe(
      filter(c => c.id != undefined)
    ).subscribe(c => {
      // const s = this.rolificador.getConcursantesInscriptos(u, c.id).subscribe(is => {
      const s = this.profileContestService.getAll<ProfileContestExpanded>(`role=4&expand=profile,profile.user,profile.fotoclub&filter[contest_id]=${c.id}`).subscribe(is => {
        // console.log('updated inscriptos', is)
        this.inscriptosJueces.next(is)
        s.unsubscribe()
      })
    })
  }
  async loadConcursantes() {
    // const u = await this.authService.user
    
    this.concurso.pipe(
      filter(c => c.id != undefined)
    ).subscribe(c => {
      const s = this.profileContestService.getAll<ProfileExpanded>(`contest_id=${c.id}&expand=fotoclub&role=3`, 'profile-registrable').subscribe(cs => {
        // console.log('updated inscriptos', is)
        this.concursantes.next(cs)
        s.unsubscribe()
      })
    })
  }
  async loadJueces() {
    // const u = await this.authService.user
    
    this.concurso.pipe(
      filter(c => c.id != undefined)
    ).subscribe(c => {
      const s = this.profileContestService.getAll<ProfileExpanded>(`contest_id=${c.id}&role=4`, 'profile-registrable').subscribe(cs => {
        // console.log('updated inscriptos', is)
        this.jueces.next(cs)
        s.unsubscribe()
      })
    })
  }
  /*async loadContestResults(attr:any = {}) {
   

    console.log(attr)
    this.concurso.pipe(
      filter(c => c.id != undefined)
    ).subscribe(c => { 
      let params:string = '';
      params += '&expand=profile,profile.user,profile.fotoclub,image.profile,image.thumbnail'
      params += '&filter[contest_id]='+c.id
      params += attr?.page ? '&page='+attr.page : ''
      params +=  (attr?.concursante_id) ? ('&filter[profile_id]=' + attr.concursante_id) : ''
      const s = this.contestResultService.getAll<ContestResultExpanded>(params).subscribe(rs => {
        this.resultadosConcurso.next(rs)
        s.unsubscribe()
      })

    })
  }*/
  imagenes_page_number:number = 1;

  async inscribirConcursante(category_id: number = undefined, ) {

    const pc = this.profileContestService.template
    pc.category_id = category_id

    let user = await this.authService.user

    if(this.rolificador.esConcursante(user) ){
      
      console.log("inscripcion yo", this.rolificador.esConcursante(user) )
      const { profileContest } = await this.UIUtilsService.mostrarModal(InscribirConcursanteComponent, {
        "concursantes": [ user.profile],
        "contest": this.concurso.getValue(),
        "categorias": this.categoriasInscriptas.getValue().map(c => c.category),
        profileContest: pc
      })
      
      if (profileContest != undefined) {
        this.loadContest(this.concurso.getValue().id)
      }
    } else {

      const { profileContest } = await this.UIUtilsService.mostrarModal(InscribirConcursanteComponent, {
        "concursantes": this.concursantes.getValue(),
        // "modalController": this.modalController,
        "contest": this.concurso.getValue(),
        "categorias": this.categoriasInscriptas.getValue().map(c => c.category),
        profileContest: pc
      })
      
      if (profileContest != undefined) {
        this.loadContest(this.concurso.getValue().id)
      }
    }
    
  }

  async inscribirJuez() {

    const pc = this.profileContestService.template
    
    const { profileContest } = await this.UIUtilsService.mostrarModal(InscribirJuecesComponent, {
      "jueces": this.jueces.getValue(),
      "contest": this.concurso.getValue()
    })

    if (profileContest != undefined) {
      this.loadContest(this.concurso.getValue().id)
    }
  }

}
