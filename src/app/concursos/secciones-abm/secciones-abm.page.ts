import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Section } from 'src/app/models/section.model';
import { SectionService } from 'src/app/services/section.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { SearchBarComponentAtributo } from 'src/app/shared/search-bar/search-bar.component';
import { SeccionPostComponent } from './seccion-post/seccion-post.component';

@Component({
  selector: 'app-secciones-abm',
  templateUrl: './secciones-abm.page.html',
  styleUrls: ['./secciones-abm.page.scss'],
})
export class SeccionesAbmPage extends ApiConsumer implements OnInit {

  public sections: Section[] = [];
  
  public atributosBusqueda: SearchBarComponentAtributo[] = [
    { 
      valor: 'name', 
      valorMostrado: 'Nombre', 
      // callback: (c: ContestResultExpanded, query: string) => c.image.title.toLowerCase().includes(query.toLowerCase())      
      callback: (s: Section, query: string) => s.name.match(new RegExp(`^${query}`, 'i'))
    }
  ];

  public mostrarFiltro: boolean = false;

  constructor(
    alertCtrl: AlertController,
    public sectionService: SectionService,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  getParentSections(base_id: number = undefined): Section[] {
    return this.sections.filter(s => s.parent_id == null && base_id != s.id)
  }
  getSubSections(parent_id: number): Section[] {
    return this.sections.filter(s => s.parent_id == parent_id)
  }

  async ngOnInit() {
    await this.UIUtilsService.presentLoading()
    super.fetch<Section[]>(() => this.sectionService.getAll()).subscribe(s => {
      this.sections = s
      this.UIUtilsService.dismissLoading()
    })
  }

  postSubSection(section: Section) {
    const subSection = this.sectionService.template
    subSection.name = `Subsección de ${section.name}`
    subSection.parent_id = section.id
    this.postSection(subSection)
  }

  async postSection(section: Section = undefined) {
    const componentProps: any = section != undefined ? { section } : {}
    // componentProps.parentSections = this.sections.filter(s => s.parent_id == null && (section ? s.id != section.id : true))
    componentProps.parentSections = this.getParentSections(section ? section.id : undefined)
    console.log('post section props', componentProps)
    const data = await this.UIUtilsService.mostrarModal(SeccionPostComponent, componentProps)
    if (data != undefined) {
      const { section } = data
      const i = this.sections.findIndex(s => s.id == section.id)
      if (i > -1) {
        this.sections[i] = section
      } else {
        this.sections.push(section)
      }
    }
  }

  deleteSection(section: Section) {
    this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'No se podrá eliminar si tiene imagenes, concursos o subsecciones asociadas.'
      }, async () => {
        const tieneSubsecciones = this.sections.find(s => s.parent_id == section.id) != undefined
        if (tieneSubsecciones) {
          this.UIUtilsService.mostrarError({ message: 'La sección tiene subsecciones asociadas.' })
        } else {
          this.fetch<void>(() => 
            this.sectionService.delete(section.id)
          ).subscribe(
            _ => {
              console.log('deleted section', section.id, _)
              this.sections.splice(this.sections.findIndex(s => s.id == section.id), 1)
              // this.router.navigate(['/concursos']);
            }, 
            async err => this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
          )
        }
    })
  }

  async mostrarAcciones(ev: any, section: Section) {
    const acciones = [
      {
        accion: () => this.postSection(section),
        icon: 'create',
        label: 'Editar'
      },
      {
        accion: () => this.deleteSection(section),
        params: [],
        icon: 'trash',
        label: 'Borrar'
      }
    ]

    // this.openPopup.emit(options)
    this.UIUtilsService.mostrarMenuAcciones(acciones, ev)
  }

  ordenarPorNombre(e1: Section, e2: Section, creciente: boolean) {
    const n1 = e1.name
    const n2 = e2.name

    return creciente ? (n1 < n2 ? -1 : (n1 == n2 ? 0 : 1)) : 
      (n1 > n2 ? -1 : (n1 == n2 ? 0 : 1))
  }


}
