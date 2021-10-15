import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
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
  concursantes: ProfileExpanded[];
  resultadosConcurso: ContestResultExpanded[];
  // fotoclubs: Fotoclub[];
  
  // @Output() openPopup = new EventEmitter<any>();
  // @Output() postImage = new EventEmitter<Image|undefined>();
  // @Output() reviewImage = new EventEmitter<ContestResultExpanded>();
  // @Output() deleteImage = new EventEmitter<ContestResultExpanded>();


  constructor(
    private concursoDetailService: ConcursoDetailService
  ) { }

  ngOnInit() {
    this.concursoDetailService.concursantes.subscribe(cs => this.concursantes = cs)
    this.concursoDetailService.resultadosConcurso.subscribe(rs => this.resultadosConcurso = rs)
  }

  // getFotoclubName(fotoclub_id: number): string {
  //   const fc = this.fotoclubs.find(f => f.id == fotoclub_id)
  //   return fc != undefined ? fc.name : ''
  // }

  // getFullName(profile_id) {
  //   const p = this.concursantes.find(p => p.id == profile_id)
  //   return p != undefined ? `${p.name} ${p.last_name}` : ''
  // }
}
