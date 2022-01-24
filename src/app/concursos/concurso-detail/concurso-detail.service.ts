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
import { UserLogged } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { filter, map } from 'rxjs/operators';
import { ContestResultService } from 'src/app/services/contest-result.service';
import { InscribirJuecesComponent } from './inscribir-jueces/inscribir-jueces.component';

@Injectable({
  providedIn: 'root'
})
export class ConcursoDetailService implements OnInit {

  
  public concurso: BehaviorSubject<Contest>;
  // public concurso: EventEmitter<Contest>;
  public concursantes: BehaviorSubject<ProfileExpanded[]>;
  public jueces: BehaviorSubject<ProfileExpanded[]>;
  // public concursantes: EventEmitter<ProfileExpanded[]>;
  public inscriptos: BehaviorSubject<ProfileContestExpanded[]>;
  public inscriptosJueces: BehaviorSubject<ProfileContestExpanded[]>;
  // public inscriptos: EventEmitter<ProfileContestExpanded[]>;
  public categoriasInscriptas: BehaviorSubject<ContestCategoryExpanded[]>;
  // public categoriasInscriptas: EventEmitter<ContestCategoryExpanded[]>;
  public seccionesInscriptas: BehaviorSubject<ContestSectionExpanded[]>;
  // public seccionesInscriptas: EventEmitter<ContestSectionExpanded[]>;
  public resultadosConcurso: BehaviorSubject<ContestResultExpanded[]>;
  // public resultadosConcurso: EventEmitter<ContestResultExpanded[]>;
  // public inscribirConcursante = new EventEmitter<number|undefined>();
  public desinscribir: EventEmitter<ProfileContestExpanded>;
  // public desinscribirJuez: EventEmitter<ProfileContestExpanded>;
  // public desinscribirConcursante = new EventEmitter<ProfileContestExpanded>();
  public postImage: EventEmitter<ImagePostParams>;
  // public postImage = new EventEmitter<ImagePostParams>();
  public reviewImage: EventEmitter<ContestResultExpanded>;
  // public reviewImage = new EventEmitter<ContestResultExpanded>();
  public deleteImage: EventEmitter<ContestResultExpanded>;
  // public deleteImage = new EventEmitter<ContestResultExpanded>();
  public mostrarAcciones: EventEmitter<any>;
  // public mostrarAcciones = new EventEmitter<any>();


  // public concursoObj: Contest = undefined
  // private concursantesArray: ProfileExpanded[] = [];
  // private categoriasInscriptasArray: ContestCategoryExpanded[] = [];
  // private inscriptosArray: ProfileContestExpanded[] = [];
  
  constructor(
    public UIUtilsService: UiUtilsService,
    private profileContestService: ProfileContestService,
    private contestService: ContestService,
    private contestResultService: ContestResultService,
    private rolificador: RolificadorService,
    private authService: AuthService
  ) { 
    // const s1 = this.concursoDetailService.postImage.subscribe(
    //   params => {
    //     this.postImage(params)
    //     // s1.unsubscribe()
    //   }
    // )
    // const s5 = this.inscribirConcursante.subscribe(category_id => this.inscribirConcursante(category_id))
    this.concurso = new BehaviorSubject<Contest>(this.contestService.template);
    // this.concurso = new EventEmitter<Contest>();
    this.concursantes = new BehaviorSubject<ProfileExpanded[]>([]);
    this.jueces = new BehaviorSubject<ProfileExpanded[]>([]);
    // this.concursantes = new EventEmitter<ProfileExpanded[]>();
    this.inscriptos = new BehaviorSubject<ProfileContestExpanded[]>([]);
    this.inscriptosJueces = new BehaviorSubject<ProfileContestExpanded[]>([]);
    // this.inscriptos = new EventEmitter<ProfileContestExpanded[]>();
    this.categoriasInscriptas = new BehaviorSubject<ContestCategoryExpanded[]>([]);
    // this.categoriasInscriptas = new EventEmitter<ContestCategoryExpanded[]>();
    this.seccionesInscriptas = new BehaviorSubject<ContestSectionExpanded[]>([]);
    // this.seccionesInscriptas = new EventEmitter<ContestSectionExpanded[]>();
    this.resultadosConcurso = new BehaviorSubject<ContestResultExpanded[]>([]);
    // this.ic inscribirConcursante = new EventEmitter<number|undefined>();
    this.desinscribir = new EventEmitter<ProfileContestExpanded>();
    // this.desinscribirJuez = new EventEmitter<ProfileContestExpanded>();
    this.postImage = new EventEmitter<ImagePostParams>();
    this.reviewImage = new EventEmitter<ContestResultExpanded>();
    this.deleteImage = new EventEmitter<ContestResultExpanded>();
    this.mostrarAcciones = new EventEmitter<any>();
    
    
    this.loadConcursantes()
    this.loadJueces()
    this.loadProfileContests()
    this.loadProfileContestsJueces()
    this.loadContestResults()
  }

  ngOnInit() {
  }

  loadContest(id: number): Promise<void> {
    const all: Promise<void>[] = []

    all.push(new Promise(resolve => {
      const s = this.contestService.get(id, 'expand=countContestResults,countProfileContests').subscribe(c => {
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
    // const s = this.rolificador.getConcursantes(u).subscribe(cs => {
    //   // console.log('updated inscriptos', is)
    //   this.concursantes.next(cs)
    //   s.unsubscribe()
    // })
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
    // const s = this.rolificador.getJueces(u).subscribe(cs => {
    //   // console.log('updated inscriptos', is)
    //   this.concursantes.next(cs)
    //   s.unsubscribe()
    // })
  }
  async loadContestResults() {
    this.concurso.pipe(
      filter(c => c.id != undefined)
    ).subscribe(c => {
      const s = this.contestResultService.getAll<ContestResultExpanded>(`expand=image.profile,image.thumbnail&filter[contest_id]=${c.id}`).subscribe(rs => {
        this.resultadosConcurso.next(rs)
        s.unsubscribe()
      })

      // const load = () => {
      //   if (this.concursantes.getValue().length > 0 && this.inscriptos.getValue().length > 0) {
      //     const s = this.contestResultService.getAll<ContestResultExpanded>(`expand=image.profile&filter[contest_id]=${this.concurso.getValue().id}`).pipe(
      //       map(results => results.filter(r => this.concursantes.getValue().find(cc => cc.id == r.image.profile_id) != undefined && this.inscriptos.getValue().find(cc => cc.profile_id == r.image.profile_id) != undefined))
      //     ).subscribe(rs => {
      //       this.resultadosConcurso.next(rs)
      //       s.unsubscribe()
      //     })
      //   } else setTimeout(load, 100)
      // }
      // setTimeout(load)
    })
  }

  async inscribirConcursante(category_id: number = undefined, ) {

    const pc = this.profileContestService.template
    pc.category_id = category_id

    // const modal = await this.modalController.create({
    //   component: InscribirConcursanteComponent,
    //   cssClass: 'auto-width',
    //   componentProps: {
    //     "concursantes": this.concursantes.filter(c => this.inscriptos.findIndex(i => i.profile_id == c.id) < 0),
    //     "modalController": this.modalController,
    //     "contest": this.concurso,
    //     "categorias": this.categoriasInscriptas.map(c => c.category),
    //     profileContest: pc
    //   }
    // });
    // await modal.present()

    // const { data } = await modal.onWillDismiss();

    // console.log('inscribiendo concursante', data)
    // const { profileContest } = data ?? {}

    let user = await this.authService.user

    if(this.rolificador.esConcursante(user) ){
      
      console.log("inscripcion yo", this.rolificador.esConcursante(user) )
      const { profileContest } = await this.UIUtilsService.mostrarModal(InscribirConcursanteComponent, {
        "concursantes": [ user.profile],
        // "modalController": this.modalController,
        "contest": this.concurso.getValue(),
        "categorias": this.categoriasInscriptas.getValue().map(c => c.category),
        profileContest: pc
      })
      
      if (profileContest != undefined) {
        this.loadContest(this.concurso.getValue().id)
        // this.inscriptosArray.push(profileContest)
        // this.inscriptos.emit(this.inscriptosArray)  
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
        // this.inscriptosArray.push(profileContest)
        // this.inscriptos.emit(this.inscriptosArray)  
      }
    }
    
  }

  async inscribirJuez() {

    const pc = this.profileContestService.template
    
    const { profileContest } = await this.UIUtilsService.mostrarModal(InscribirJuecesComponent, {
      "jueces": this.jueces.getValue(),
      // "modalController": this.modalController,
      // "contest": this.concurso.getValue()
      "contest": this.concurso.getValue()
    })

    if (profileContest != undefined) {
      this.loadContest(this.concurso.getValue().id)
      // this.inscriptosArray.push(profileContest)
      // this.inscriptos.emit(this.inscriptosArray)  
    }
  }

}
