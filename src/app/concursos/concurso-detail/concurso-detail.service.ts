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

@Injectable({
  providedIn: 'root'
})
export class ConcursoDetailService implements OnInit {

  public concurso: EventEmitter<Contest>;
  // public concurso = new EventEmitter<Contest>();
  public concursantes: EventEmitter<ProfileExpanded[]>;
  // public concursantes = new EventEmitter<ProfileExpanded[]>();
  public inscriptos: EventEmitter<ProfileContestExpanded[]>;
  // public inscriptos = new EventEmitter<ProfileContestExpanded[]>();
  public categoriasInscriptas: EventEmitter<ContestCategoryExpanded[]>;
  // public categoriasInscriptas = new EventEmitter<ContestCategoryExpanded[]>();
  public seccionesInscriptas: EventEmitter<ContestSectionExpanded[]>;
  // public seccionesInscriptas = new EventEmitter<ContestSectionExpanded[]>();
  public resultadosConcurso: EventEmitter<ContestResultExpanded[]>;
  // public resultadosConcurso = new EventEmitter<ContestResultExpanded[]>();
  // public inscribirConcursante = new EventEmitter<number|undefined>();
  public desinscribirConcursante: EventEmitter<ProfileContestExpanded>;
  // public desinscribirConcursante = new EventEmitter<ProfileContestExpanded>();
  public postImage: EventEmitter<ImagePostParams>;
  // public postImage = new EventEmitter<ImagePostParams>();
  public reviewImage: EventEmitter<ContestResultExpanded>;
  // public reviewImage = new EventEmitter<ContestResultExpanded>();
  public deleteImage: EventEmitter<ContestResultExpanded>;
  // public deleteImage = new EventEmitter<ContestResultExpanded>();
  public mostrarAcciones: EventEmitter<any>;
  // public mostrarAcciones = new EventEmitter<any>();


  public concursoObj: Contest = undefined
  private concursantesArray: ProfileExpanded[] = [];
  private categoriasInscriptasArray: ContestCategoryExpanded[] = [];
  private inscriptosArray: ProfileContestExpanded[] = [];
  
  constructor(
    public UIUtilsService: UiUtilsService,
    private profileContestService: ProfileContestService
  ) { 
    // const s1 = this.concursoDetailService.postImage.subscribe(
    //   params => {
    //     this.postImage(params)
    //     // s1.unsubscribe()
    //   }
    // )
    // const s5 = this.inscribirConcursante.subscribe(category_id => this.inscribirConcursante(category_id))
    this.concurso = new EventEmitter<Contest>();
    this.concursantes = new EventEmitter<ProfileExpanded[]>();
    this.inscriptos = new EventEmitter<ProfileContestExpanded[]>();
    this.categoriasInscriptas = new EventEmitter<ContestCategoryExpanded[]>();
    this.seccionesInscriptas = new EventEmitter<ContestSectionExpanded[]>();
    this.resultadosConcurso = new EventEmitter<ContestResultExpanded[]>();
    // this.ic inscribirConcursante = new EventEmitter<number|undefined>();
    this.desinscribirConcursante = new EventEmitter<ProfileContestExpanded>();
    this.postImage = new EventEmitter<ImagePostParams>();
    this.reviewImage = new EventEmitter<ContestResultExpanded>();
    this.deleteImage = new EventEmitter<ContestResultExpanded>();
    this.mostrarAcciones = new EventEmitter<any>();
    this.concurso.subscribe(c => this.concursoObj = c)
    this.concursantes.subscribe(c => this.concursantesArray = c)
    this.categoriasInscriptas.subscribe(c => this.categoriasInscriptasArray = c)
    this.inscriptos.subscribe(c => this.inscriptosArray = c)
  }

  ngOnInit() {
  }

  async inscribirConcursante(category_id: number = undefined) {

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
    const { profileContest } = await this.UIUtilsService.mostrarModal(InscribirConcursanteComponent, {
      "concursantes": this.concursantesArray.filter(c => this.inscriptosArray.findIndex(i => i.profile_id == c.id) < 0),
      // "modalController": this.modalController,
      "contest": this.concursoObj,
      "categorias": this.categoriasInscriptasArray.map(c => c.category),
      profileContest: pc
    })

    if (profileContest != undefined) {
      this.inscriptosArray.push(profileContest)
      this.inscriptos.emit(this.inscriptosArray)  
    }
  }

}
