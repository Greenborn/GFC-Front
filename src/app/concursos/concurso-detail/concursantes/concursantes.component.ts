import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Contest } from 'src/app/models/contest.model';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { ContestService } from 'src/app/services/contest.service';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
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
  concurso: Contest = this.contestService.template;
  concursantes: ProfileExpanded[] = [];
  inscriptos: ProfileContestExpanded[] = [];
  resultadosConcurso: ContestResultExpanded[] = [];
  // fotoclubs: Fotoclub[];
  mostrarFiltro: boolean = false
  public loading: boolean = true

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
    public contestService: ContestService
  ) { }

  ngOnInit() {
    this.concursoDetailService.concursantes.subscribe(cs => this.concursantes = cs)
    this.concursoDetailService.inscriptos.subscribe(is => this.inscriptos = is)
    this.concursoDetailService.concurso.subscribe(c => this.concurso = c)
    this.concursoDetailService.resultadosConcurso.subscribe(rs => {
      this.resultadosConcurso = rs 
      this.loading = false
    })
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



  async mostrarAcciones(ev: any, p: ProfileContestExpanded) {
    const options = {
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones: [
          // {
          //   accion: (params: []) => this.concursoDetailService.reviewImage.emit(r),
          //   // accion: (params: []) => this.reviewImage(r),
          //   params: [],
          //   icon: 'star-outline',
          //   label: 'Puntuar'
          // },
          {
            accion: (params: []) => this.concursoDetailService.postImage.emit({
              id: undefined,
              profile_id: p.profile_id,
              code: undefined,
              title: undefined
            }),
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
        ]
      },
      cssClass: 'auto-width',
      event: ev,
      translucent: true,
      // mode: "ios" //para mostrar con la patita, pero es otro estilo y muy angosto
    }

    // this.openPopup.emit(options)
    this.concursoDetailService.mostrarAcciones.emit(options)
  }
}
