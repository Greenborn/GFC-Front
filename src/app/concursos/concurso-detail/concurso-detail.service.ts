import { EventEmitter, Injectable } from '@angular/core';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { Image } from 'src/app/models/image.model';


@Injectable({
  providedIn: 'root'
})
export class ConcursoDetailService {

  public concursantes = new EventEmitter<ProfileExpanded[]>();
  public resultadosConcurso = new EventEmitter<ContestResultExpanded[]>();
  public postImage = new EventEmitter<Image|undefined>();
  public reviewImage = new EventEmitter<ContestResultExpanded>();
  public deleteImage = new EventEmitter<ContestResultExpanded>();
  public mostrarAcciones = new EventEmitter<any>();
  
  constructor() { }


}
