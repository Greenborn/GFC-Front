import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ContestService } from 'src/app/services/contest.service';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Contest } from 'src/app/models/contest.model';
import { AlertController } from '@ionic/angular';
import { Category } from 'src/app/models/category.model';
import { CategoryService } from 'src/app/services/category.service';
import { ContestCategory } from 'src/app/models/contest_category.model';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ContestCategoryService } from 'src/app/services/contest-category.service';
import { Section } from 'src/app/models/section.model';
import { SectionService } from 'src/app/services/section.service';
import { ContestSectionService } from 'src/app/services/contest-section.service';
import { ContestSection } from 'src/app/models/contest_section.model';

@Component({
  selector: 'app-concurso-post',
  templateUrl: './concurso-post.page.html',
  styleUrls: ['./concurso-post.page.scss'],
})
export class ConcursoPostPage extends ApiConsumer implements OnInit {

  concurso: Contest = this.contestService.template;
  categorias: Category[] = [];
  categoriasInscriptas: ContestCategory[] = [];
  categoriasSeleccionadas: { id: number; seleccionada: boolean; }[] = [];
  secciones: Section[] = [];
  seccionesSeleccionadas: { id: number; seleccionada: boolean; }[] = [];
  seccionesInscriptas: ContestSection[] = [];
  public posting: boolean = false;
  public loading: boolean = false;
  public updatingSelect: boolean = false;
  public mostrarCategorias: boolean = false;
  public mostrarSecciones: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    public contestService: ContestService,
    private categoryService: CategoryService,
    private contestCategoryService: ContestCategoryService,
    private sectionService: SectionService,
    private contestSectionService: ContestSectionService,
    private router: Router,
    alertCtrl: AlertController,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');

      const getCategorias = new Promise<void>(resolve => 
        super.fetch<Category[]>(() => this.categoryService.getAll()).subscribe(c => {
          this.categorias = c
          resolve()
        })
      )
      const getSecciones = new Promise<void>(resolve => 
        super.fetch<Section[]>(() => this.sectionService.getAll()).subscribe(s => {
          this.secciones = s
          resolve()
        })
      )
      
      if (id != null) {
        this.loading = true
        super.fetch<Contest>(() => 
          this.contestService.get(parseInt(id))
        ).subscribe(c => {
          // c.start_date = this.contestService.formatearFechaParaHTML(c.start_date);
          // c.end_date = this.contestService.formatearFechaParaHTML(c.end_date);
          this.concurso = c
          
          super.fetch<ContestCategory[]>(() => this.contestService.getCategoriasInscriptas(c.id)).subscribe(async c => {
            this.categoriasInscriptas = c
            await getCategorias
            this.categoriasSeleccionadas = this.categorias.map(c => ({
              id: c.id,
              seleccionada: this.categoriasInscriptas.find(c1 => c1.category_id == c.id) != undefined
            }))
            await getSecciones
            // this.seccionesSeleccionadas = this.secciones.map(c => ({
            //   id: c.id,
            //   seleccionada: this.seccionesInscriptas.find(s1 => s1.section_id == c.id) != undefined
            // }))
            this.loading = false
          })
          super.fetch<ContestSection[]>(() => this.contestService.getSeccionesInscriptas(c.id)).subscribe(async s => {
            this.seccionesInscriptas = s
            await getCategorias
            this.seccionesSeleccionadas = this.secciones.map(s => ({
              id: s.id,
              seleccionada: this.seccionesInscriptas.find(s1 => s1.section_id == s.id) != undefined
            }))
            await getSecciones
            // this.seccionesSeleccionadas = this.secciones.map(c => ({
            //   id: c.id,
            //   seleccionada: this.seccionesInscriptas.find(s1 => s1.section_id == c.id) != undefined
            // }))
            this.loading = false
          })
        })
      } else {
        getCategorias.then(() => {
          this.categoriasSeleccionadas = this.categorias.map(c => ({
            id: c.id,
            seleccionada: true
          }))
          this.mostrarCategorias = false
        })
        getSecciones.then(() => {
          this.seccionesSeleccionadas = this.secciones.map(s => ({
            id: s.id,
            seleccionada: s.parent_id == null
          }))
          this.mostrarSecciones = false
        })
      }
    })
  }
  

  
  getCategoriaSeleccionada(id: number) {
    return this.categoriasSeleccionadas.find(c => c.id == id)
  }
  getSeccionSeleccionada(id: number) {
    return this.seccionesSeleccionadas.find(c => c.id == id)
  }

  getParentSections() {
    return this.secciones.filter(s => s.parent_id == null)
  }

  getSubSections(id: number) {
    return this.secciones.filter(s => s.parent_id == id)
  }

  get formTitle(): string {
    if (this.loading) return ''
    const c = this.concurso;
    return (c.id != null ? 'Editar' : 'Agregar') + ' concurso'
  }
  get backUrl(): string {
    const c = this.concurso 
    return '/concursos' + (c.id != null ? `/${c.id}` : '')
  }

  async postConcurso(f: NgForm) {
    if (f.valid) {
      const model = {
        ...f.value,
        start_date: this.contestService.formatearFechaParaBD(f.value.start_date),
        end_date: this.contestService.formatearFechaParaBD(f.value.end_date)
      }
      console.log('posting concurso', model, this.concurso.id)
      this.posting = true
      super.fetch<Contest>(() =>
        this.contestService.post(model, this.concurso.id)
      ).subscribe(
        async c => {

          // check y post categorias inscriptas

          console.log(this.categoriasSeleccionadas, this.categoriasInscriptas)

          const inscripcionesCategorias: Promise<ContestCategory>[] = []
          const desinscripcionesCategorias: Promise<boolean>[] = []

          for (let c of this.categoriasSeleccionadas) {
            let cc = this.categoriasInscriptas.find(c1 => c1.category_id == c.id)
            if (c.seleccionada) {
              if (cc == undefined) {
                // eliminar
                inscripcionesCategorias.push(this.agregarCategoria(c.id).catch(e => e))
              }
            } else if (cc != undefined) {
              desinscripcionesCategorias.push(this.desinscribirCategoria(cc))
            }
          }

          const resInscripcionesCategorias = await Promise.all(inscripcionesCategorias) 
          const resDesinscripcionesCategorias = await Promise.all(desinscripcionesCategorias)

          this.categoriasInscriptas.push(...resInscripcionesCategorias.map(cc => this.categoriasInscriptas.find(ci => ci.id == cc.id)))
          // TODO: eliminar desinscripciones

          const inscripcionesSecciones: Promise<ContestCategory>[] = []
          const desinscripcionesSecciones: Promise<boolean>[] = []

          for (let c of this.seccionesSeleccionadas) {
            let cc = this.seccionesInscriptas.find(c1 => c1.section_id == c.id)
            if (c.seleccionada) {
              if (cc == undefined) {
                // eliminar
                inscripcionesSecciones.push(this.agregarSeccion(c.id).catch(e => e))
              }
            } else if (cc != undefined) {
              desinscripcionesSecciones.push(this.desinscribirSeccion(cc))
            }
          }

          const resInscripcionesSecciones = await Promise.all(inscripcionesSecciones) 
          const resDesinscripcionesSecciones = await Promise.all(desinscripcionesSecciones)

          this.seccionesInscriptas.push(...resInscripcionesSecciones.map(cc => this.seccionesInscriptas.find(ci => ci.id == cc.id)))
          // // TODO: eliminar desinscripciones

          this.posting = false
          console.log('posteado', c)
          if (resDesinscripcionesCategorias.find(r => r === false) == undefined && resDesinscripcionesSecciones.find(r => r === false) == undefined)
            this.router.navigate(['/concursos/', c.id]);
        },
        async err => {
          this.posting = false;
          (await this.alertCtrl.create({
            header: 'Error',
            message: (err.error as []).map(e => (e as any).message).join('<br>'),
            buttons: [{
              text: 'Ok',
              role: 'cancel'
            }]
          })).present()
        },
      )
      // this.router.navigate(['/concursos/' + id]);
    }
    else {
      console.log('Form concurso no valido:', f.value);
    }
  }

  get categoriasNoInscriptas(): Category[] {
    return this.categorias.filter(c => !this.categoriasInscriptas.find(cc => cc.category_id == c.id))
  }

  getCategoryName(id: number) {
    return this.categorias.find(c => c.id == id).name
  }

  // async agregarCategoria(ev) {
    // const category_id: number = (ev.target as HTMLIonSelectElement).value
  async agregarCategoria(category_id: number): Promise<ContestCategory> {
    return new Promise((resolve, reject) => {
      const model: ContestCategory = {
        contest_id: this.concurso.id,
        category_id
      }
      console.log('agregando categoria', model)
      super.fetch<ContestCategory>(() => this.contestCategoryService.post(model)).subscribe(
        cc => {
          this.categoriasInscriptas.push(cc)
          resolve(cc)
        },
        err => {
          reject(err)
          console.log('Error post contest category', err)
          this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
        }
      )
    })
  }

  async desinscribirCategoria(contestCategory: ContestCategory): Promise<boolean> {
    const categoria = this.categorias.find(c => c.id == contestCategory.category_id)
    return new Promise(async (resolve, reject) => {
      const alert = await this.UIUtilsService.mostrarAlert({
        header: `Confirmar desinscripción a ${categoria.name}`,
        message: 'No se podrá eliminar si tiene concursantes inscriptos.'
        }, 
        async () => {

          this.fetch<void>(() => 
            this.contestCategoryService.delete(contestCategory.id)
          ).subscribe(
            _ => {
              console.log('deleted contest category', contestCategory, _)
              // this.updatingSelect = true
              this.categoriasInscriptas.splice(this.categoriasInscriptas.findIndex(c => c.id == contestCategory.id), 1)
              resolve(true)
              // setTimeout(() => this.updatingSelect = false)
              // this.router.navigate(['/concursos']);
            }, 
            async err => {
              this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
              resolve(false)
            }
          )
          // }
        }, 
        async () => resolve(true)
      )
    })
  }
  async agregarSeccion(section_id: number): Promise<ContestSection> {
    return new Promise((resolve, reject) => {
      const model: ContestSection = {
        contest_id: this.concurso.id,
        section_id
      }
      console.log('agregando seccion', model)
      super.fetch<ContestSection>(() => this.contestSectionService.post(model)).subscribe(
        cc => {
          this.seccionesInscriptas.push(cc)
          resolve(cc)
        },
        err => {
          reject(err)
          console.log('Error post contest section', err)
          this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
        }
      )
    })
  }

  async desinscribirSeccion(contestSection: ContestSection): Promise<boolean> {
    const seccion = this.secciones.find(c => c.id == contestSection.section_id)
    return new Promise(async (resolve, reject) => {
      const alert = await this.UIUtilsService.mostrarAlert({
        header: `Confirmar desinscripción a ${seccion.name}`,
        message: 'No se podrá eliminar si tiene fotos asociadas.'
        }, 
        async () => {

          this.fetch<void>(() => 
            this.contestSectionService.delete(contestSection.id)
          ).subscribe(
            _ => {
              console.log('deleted contest section', contestSection, _)
              // this.updatingSelect = true
              this.seccionesInscriptas.splice(this.seccionesInscriptas.findIndex(c => c.id == contestSection.id), 1)
              resolve(true)
              // setTimeout(() => this.updatingSelect = false)
              // this.router.navigate(['/concursos']);
            }, 
            async err => {
              this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
              resolve(false)
            }
          )
          // }
        }, 
        async () => resolve(true)
      )
    })
  }
  
}
