import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { Image } from 'src/app/models/image.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { MenuAccionesComponent } from 'src/app/shared/menu-acciones/menu-acciones.component';
import { ConcursoDetailService } from '../concurso-detail.service';

@Component({
  selector: 'app-fotografias',
  templateUrl: './fotografias.component.html',
  styleUrls: ['./fotografias.component.scss'],
  // providers: [ConcursoDetailService]
})
export class FotografiasComponent implements OnInit {

  @Input() concursantes: ProfileExpanded[] = [];
  @Input() resultadosConcurso: ContestResultExpanded[] = [];
  @Input() fotoclubs: Fotoclub[] = [];

  @Output() openPopup = new EventEmitter<any>();
  @Output() postImage = new EventEmitter<Image|undefined>();
  @Output() reviewImage = new EventEmitter<ContestResultExpanded>();
  @Output() deleteImage = new EventEmitter<ContestResultExpanded>();


  mostrarFiltro: boolean = false;
  constructor(
    public concursoDetailService: ConcursoDetailService
  ) { }

  ngOnInit() {
    const s1 = this.concursoDetailService.concursantes.subscribe(
      cs => {
        this.concursantes = cs
        s1.unsubscribe()
      }
    )
    const s2 = this.concursoDetailService.resultadosConcurso.subscribe(
      rs => {
        this.resultadosConcurso = rs
        s2.unsubscribe()
      }
    )
  }

  toggleFiltro() {
    this.mostrarFiltro = !this.mostrarFiltro;
  }

  getFotoclubName(fotoclub_id: number): string {
    const fc = this.fotoclubs.find(f => f.id == fotoclub_id)
    return fc != undefined ? fc.name : ''
  }

  getFullName(profile_id: number) {
    const p = this.concursantes.find(p => p.id == profile_id)
    return p != undefined ? `${p.name} ${p.last_name}` : ''
  }

  async mostrarAcciones(ev: any, r: ContestResultExpanded) {
    const i = r.image
    const options = {
      component: MenuAccionesComponent, //componente a mostrar
      componentProps: {
        acciones: [
          {
            accion: (params: []) => this.concursoDetailService.reviewImage.emit(r),
            // accion: (params: []) => this.reviewImage(r),
            params: [],
            icon: 'star-outline',
            label: 'Puntuar'
          },
          {
            accion: (params: []) => this.concursoDetailService.postImage.emit(i),
            // accion: (params: []) => this.postImage(i),
            params: [],
            icon: 'create',
            label: 'Editar'
          },
          {
            accion: (params: number[]) => this.concursoDetailService.deleteImage.emit(r),
            // accion: (params: number[]) => this.deleteImage(r.image_id, r.id, r.metric_id),
            params: [],
            icon: 'trash',
            label: 'Borrar'
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
