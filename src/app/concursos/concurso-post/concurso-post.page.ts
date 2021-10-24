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

@Component({
  selector: 'app-concurso-post',
  templateUrl: './concurso-post.page.html',
  styleUrls: ['./concurso-post.page.scss'],
})
export class ConcursoPostPage extends ApiConsumer implements OnInit {

  concurso: Contest = this.contestService.template;
  categorias: Category[] = [];
  categoriasInscriptas: ContestCategory[] = []
  public posting: boolean = false;
  public loading: boolean = false;
  public updatingSelect: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    public contestService: ContestService,
    private categoryService: CategoryService,
    private contestCategoryService: ContestCategoryService,
    private router: Router,
    alertCtrl: AlertController,
    private UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  async ngOnInit() {
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');

      if (id != null) {
        this.loading = true
        super.fetch<Contest>(() => 
          this.contestService.get(parseInt(id))
        ).subscribe(c => {
          // c.start_date = this.contestService.formatearFechaParaHTML(c.start_date);
          // c.end_date = this.contestService.formatearFechaParaHTML(c.end_date);
          this.concurso = c

          super.fetch<Category[]>(() => this.categoryService.getAll()).subscribe(c => this.categorias = c)
          super.fetch<ContestCategory[]>(() => this.contestService.getCategoriasInscriptas(c.id)).subscribe(c => {
            this.categoriasInscriptas = c
            this.loading = false
          })
        })
      }
    })
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
        c => {
          this.posting = false
          console.log('posteado', c)
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

  async agregarCategoria(ev) {
    const category_id: number = (ev.target as HTMLIonSelectElement).value
    const model: ContestCategory = {
      contest_id: this.concurso.id,
      category_id
    }
    console.log('agregando categoria', model)
    super.fetch<ContestCategory>(() => this.contestCategoryService.post(model)).subscribe(
      cc => {
        this.updatingSelect = true
        this.categoriasInscriptas.push(cc)
        setTimeout(() => this.updatingSelect = false)
      },
      err => {
        console.log('Error post contest category', err)
        this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
      }
    )
  }

  async desinscribirCategoria(contest_category_id: number) {
    this.UIUtilsService.mostrarAlert({
      header: 'Confirmar borrado',
      message: 'No se podrá eliminar si tiene concursantes inscriptos.'
      }, async () => {
        // const tieneSubsecciones = this.sections.find(s => s.parent_id == section.id) != undefined
        // if (tieneSubsecciones) {
          // this.UIUtilsService.mostrarError({ message: 'La sección tiene subsecciones asociadas.' })
        // } else {

          this.fetch<void>(() => 
            this.contestCategoryService.delete(contest_category_id)
          ).subscribe(
            _ => {
              console.log('deleted contest category', contest_category_id, _)
              this.updatingSelect = true
              this.categoriasInscriptas.splice(this.categoriasInscriptas.findIndex(c => c.id == contest_category_id), 1)
              setTimeout(() => this.updatingSelect = false)
              // this.router.navigate(['/concursos']);
            }, 
            async err => this.UIUtilsService.mostrarError({ message: err.error['error-info'][2] })
          )
        // }
    })
  }
  
}
