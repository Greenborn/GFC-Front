import { EventEmitter, Injectable } from '@angular/core';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { Image } from 'src/app/models/image.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';


@Injectable({
  providedIn: 'root'
})
export class ConcursoDetailService {

  public concursantes = new EventEmitter<ProfileExpanded[]>();
  public inscriptos = new EventEmitter<ProfileContestExpanded[]>();
  public resultadosConcurso = new EventEmitter<ContestResultExpanded[]>();
  public inscribirConcursante = new EventEmitter<void>();
  public desinscribirConcursante = new EventEmitter<ProfileContestExpanded>();
  public postImage = new EventEmitter<Image|undefined>();
  public reviewImage = new EventEmitter<ContestResultExpanded>();
  public deleteImage = new EventEmitter<ContestResultExpanded>();
  public mostrarAcciones = new EventEmitter<any>();
  
  constructor() { }


}
