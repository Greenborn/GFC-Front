import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ConcursoDetailService } from '../concurso-detail.service';

@Component({
  selector: 'app-concursantes',
  templateUrl: './concursantes.component.html',
  styleUrls: ['./concursantes.component.scss'],
  // providers: [ ConcursoDetailService ]
})
export class ConcursantesComponent implements OnInit {

  // @Input() concursantes: ProfileExpanded[];
  // @Input() resultadosConcurso: ContestResultExpanded[];
  // @Input() fotoclubs: Fotoclub[];
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  resultadosConcurso: ContestResultExpanded[] = [];
  // fotoclubs: Fotoclub[];
  
  // @Output() openPopup = new EventEmitter<any>();
  // @Output() postImage = new EventEmitter<Image|undefined>();
  // @Output() reviewImage = new EventEmitter<ContestResultExpanded>();
  // @Output() deleteImage = new EventEmitter<ContestResultExpanded>();


  constructor(
    public concursoDetailService: ConcursoDetailService,
    public rolificador: RolificadorService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.concursoDetailService.concursantes.subscribe(cs => this.concursantes = cs)
    this.concursoDetailService.inscriptos.subscribe(is => this.inscriptos = is)
    this.concursoDetailService.resultadosConcurso.subscribe(rs => this.resultadosConcurso = rs)
  }

  getFotosCargadas(profile_id: number) {
    return this.resultadosConcurso.filter(cr => cr.image.profile_id == profile_id).length
  }

  getFotoclubName(profile_id: number): string {
    const profile = this.concursantes.find(p => p.id == profile_id)
    return profile != undefined ? profile.fotoclub.name : ''
  }

  getFullName(profile_id: number) {
    const p = this.concursantes.find(p => p.id == profile_id)
    return p != undefined ? `${p.name} ${p.last_name}` : ''
  }
}
