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
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  descrChangeFocus: boolean = false;
  public posting: boolean = false;
  // public loading: boolean = false;
  public loadingCategorias: boolean = true;
  public loadingSecciones: boolean = true;
  public updatingSelect: boolean = false;
  public mostrarCategorias: boolean;
  public mostrarSecciones: boolean;
  public image_file: File;
  public img_url: string = '';
  public rules_file: File;
  public rules_url: SafeResourceUrl;
  noImg: boolean = false;

  public day_selects = [{days:[], months:[], years:[], day:-1, month: -1, year: -1, hours:[], minutes:[], hour:0, minute:0, selected_str: "" }, {days:[], months:[], years:[], day:-1, month: -1, year: -1, hours:[], minutes:[], hour:0, minute:0, selected_str: "" }]

  constructor(
    private activatedRoute: ActivatedRoute,
    public contestService: ContestService,
    private categoryService: CategoryService,
    private contestCategoryService: ContestCategoryService,
    private sectionService: SectionService,
    private contestSectionService: ContestSectionService,
    private router: Router,
    alertCtrl: AlertController,
    public UIUtilsService: UiUtilsService,
    public responsiveService: ResponsiveService,
    public configService: ConfigService,
    private sanitizer: DomSanitizer
  ) { 
    super(alertCtrl)
  }

get secycat(){
  let cat = this.categoriasSeleccionadas.filter(function(c) {
    return c.seleccionada !== false}).length; 
  let sec = this.seccionesSeleccionadas.filter(function(c) {
    return c.seleccionada !== false}).length; 
    console.log("cantidades actuales: ", cat, sec)
  return cat == 0 || sec == 0
}

  daysInMonth (month, year) { return new Date(year, month, 0).getDate(); }


  async ngOnInit() {
    await this.UIUtilsService.presentLoading();
    this.mostrarCategorias = false
    this.mostrarSecciones = false
    this.activatedRoute.paramMap.subscribe(async paramMap => {
      const id = paramMap.get('id');

      const getCategorias = new Promise<void>(resolve => 
        super.fetch<Category[]>(() => this.categoryService.getAll()).subscribe(c => {
          this.categorias = c
          this.loadingCategorias = false
          resolve()
        })
      )
      const getSecciones = new Promise<void>(resolve => 
        super.fetch<Section[]>(() => this.sectionService.getAll()).subscribe(s => {
          this.secciones = s
          this.loadingSecciones = false
          resolve()
        })
      )

      this.calendarDefineDays(0)
      this.calendarDefineTime(0)
      this.calendarDefineTime(1)
      this.calendarDefineDays(1)
      this.calendarDefineYears(0)
      this.calendarDefineYears(1)
      
      this.day_selects[0].months = [
        {v:0, t:'Enero'}, 
        {v:1, t:'Febrero'}, 
        {v:2, t:'Marzo'}, 
        {v:3, t:'Abril'}, 
        {v:4, t:'Mayo'}, 
        {v:5, t:'Junio'}, 
        {v:6, t:'Julio'},
        {v:7, t:'Agosto'}, 
        {v:8, t:'Septiembre'}, 
        {v:9, t:'Octubre'}, 
        {v:10, t:'Noviembre'}, 
        {v:11, t:'Diciembre'}]
      this.day_selects[1].months = this.day_selects[0].months
      
      if (id != null) {
        // this.loading = true
        super.fetch<Contest>(() => 
          this.contestService.get(parseInt(id),'expand=contestRecords')
        ).subscribe(c => {
          // c.start_date = this.contestService.formatearFechaParaHTML(c.start_date);
          // c.end_date = this.contestService.formatearFechaParaHTML(c.end_date);
          this.concurso = c
          this.day_selects[0].day = new Date(this.concurso.start_date).getDate()
          this.day_selects[0].month = new Date(this.concurso.start_date).getMonth()
          this.day_selects[0].year = new Date(this.concurso.start_date).getFullYear()
          this.day_selects[0].hour = new Date(this.concurso.start_date).getHours()
          this.day_selects[0].minute = new Date(this.concurso.start_date).getMinutes()
          this.day_selects[1].day = new Date(this.concurso.end_date).getDate()
          this.day_selects[1].month = new Date(this.concurso.end_date).getMonth()
          this.day_selects[1].year = new Date(this.concurso.end_date).getFullYear()
          this.day_selects[1].hour = new Date(this.concurso.end_date).getHours()
          this.day_selects[1].minute = new Date(this.concurso.end_date).getMinutes()
          this.img_url = this.configService.apiUrl(c.img_url)
          if (c.rules_url)
            // this.rules_url = this.configService.apiUrl(c.rules_url)
            this.rules_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.configService.apiUrl(c.rules_url))
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
            // this.loading = false
          })
          super.fetch<ContestSection[]>(() => this.contestService.getSeccionesInscriptas(c.id)).subscribe(async s => {
            this.seccionesInscriptas = s
            await getCategorias
            this.seccionesSeleccionadas = this.secciones.map(s => ({
              id: s.id,
              seleccionada: this.seccionesInscriptas.find(s1 => s1.section_id == s.id) != undefined
            }))
            await getSecciones
            this.UIUtilsService.dismissLoading()
            // this.seccionesSeleccionadas = this.secciones.map(c => ({
            //   id: c.id,
            //   seleccionada: this.seccionesInscriptas.find(s1 => s1.section_id == c.id) != undefined
            // }))
            // this.loading = false
          })
        })
      } else {
        let fecha =  new Date()
        this.concurso.start_date = fecha.toISOString()
        this.day_selects[0].selected_str = this.concurso.start_date
        
        
        getCategorias.then(() => {
          this.categoriasSeleccionadas = this.categorias.map(c => ({
            id: c.id,
            seleccionada: true
          }))
        })
        getSecciones.then(() => {
          this.seccionesSeleccionadas = this.secciones.map(s => ({
            id: s.id,
            seleccionada: s.parent_id == null
          }))
          this.UIUtilsService.dismissLoading()
        })
      }
    })
  }

  calendarDefineTime(id){
    this.day_selects[id].minutes = []
    for (let c=0; c < 60; c++)
      this.day_selects[id].minutes.push({v:c, t:c})

    this.day_selects[id].hours = []
    for (let c=0; c < 24; c++)
      this.day_selects[id].hours.push({v:c, t:c})
  }

  calendarDefineYears(id){
    let anio = new Date().getFullYear()
    this.day_selects[id].years = []
    for (let c=0; c < 10; c++)
      this.day_selects[id].years.push({v:anio + c, t: anio + c})
  }

  calendarDefineDays(id){
    this.day_selects[id].days = []
    let days = 31//this.daysInMonth(fecha.getMonth(), fecha.getFullYear())
    let d_aux = this.day_selects[id].day
    for (let c=1; c <= days; c ++)
      this.day_selects[id].days.push({v:c,t:c})
    if (d_aux <= days){
      this.day_selects[id].day = d_aux
    }
  }

  monthChange(id){
    if (this.day_selects[id] == undefined && this.day_selects[id].selected_str == undefined)
      return 
    let fecha = new Date(this.day_selects[id].selected_str)
    this.calendarDefineDays(id)
  }

  dateUpdate(){ //Este codigo no me gusta del todo, luego lo mejorare
    if (Number(this.day_selects[0].day) != -1 && Number(this.day_selects[0].month) != -1 && Number(this.day_selects[0].year) != -1 && Number(this.day_selects[0].hour) != -1 && Number(this.day_selects[0].minute) != -1){
      this.day_selects[0].selected_str = new Date(Number(this.day_selects[0].year), Number(this.day_selects[0].month), Number(this.day_selects[0].day),Number(this.day_selects[0].hour),Number(this.day_selects[0].minute)).toISOString()
      this.concurso.start_date =  this.day_selects[0].selected_str
    } else {
      this.day_selects[0].selected_str = "-1"
    }
    if (Number(this.day_selects[1].day) != -1 && Number(this.day_selects[1].month) != -1 && Number(this.day_selects[1].year) != -1 && Number(this.day_selects[1].hour) != -1 && Number(this.day_selects[1].minute) != -1){
      this.day_selects[1].selected_str = new Date(Number(this.day_selects[1].year), Number(this.day_selects[1].month), Number(this.day_selects[1].day),Number(this.day_selects[1].hour),Number(this.day_selects[1].minute)).toISOString()
      this.concurso.end_date =  this.day_selects[1].selected_str
    } else {
      this.day_selects[1].selected_str = "-1"
    }
    
    console.log('date slect', this.concurso, this.day_selects)
  }
  
  getCategoriaSeleccionada(id: number) {
    return this.categoriasSeleccionadas.find(c => c.id == id)
  }
  getSeccionSeleccionada(id: number) {
    return this.seccionesSeleccionadas.find(c => c.id == id)
  }

  // getParentSections() {
  //   return this.secciones.filter(s => s.parent_id == null)
  // }

  // getSubSections(id: number) {
  //   return this.secciones.filter(s => s.parent_id == id)
  // }

  get formTitle(): string {
    // if (this.loading) return ''
    const c = this.concurso;
    return c ? ((c.id != null ? 'Editar' : 'Agregar') + ' concurso') : ''
  }
  get backUrl(): string {
    const c = this.concurso 
    return '/concursos' + (c.id != null ? `/${c.id}` : '')
  }

  async postConcurso(f: NgForm) {
    if (this.day_selects[0].selected_str == '-1'){
      this.posting = false;
      (await this.alertCtrl.create({
        header: 'Error',
        message: "Fecha de Inicio inválida.",
        buttons: [{
          text: 'Ok',
          role: 'cancel'
        }]
      })).present()
      return
    }

    if (this.day_selects[1].selected_str == '-1'){
      this.posting = false;
      (await this.alertCtrl.create({
        header: 'Error',
        message: "Fecha de Finalización inválida.",
        buttons: [{
          text: 'Ok',
          role: 'cancel'
        }]
      })).present()
      return
    }

    if (f.valid && !this.secycat) {
      console.log("secycat: ", this.secycat)
      const model = {
        ...f.value,
        start_date: this.concurso.start_date,
        end_date: this.concurso.end_date
      }
      if (this.image_file != undefined) {
        model.image_file = this.image_file
      }
      if (this.rules_file != undefined) {
        model.rules_file = this.rules_file
      }
      this.posting = true;
      
      super.fetch<any>(() =>
        this.contestService.postFormData<any>(model, this.concurso.id)
      ).subscribe(
        async contest => {
          // check y post categorias inscriptas
          const inscripcionesCategorias: Promise<ContestCategory>[] = []
          const desinscripcionesCategorias: Promise<boolean>[] = []

          for (let c of this.categoriasSeleccionadas) {
            let cc = this.categoriasInscriptas.find(c1 => c1.category_id == c.id)
            if (c.seleccionada) {
              if (cc == undefined) {
                // eliminar
                inscripcionesCategorias.push(this.agregarCategoria(c.id, contest.id).catch(e => e))
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
                inscripcionesSecciones.push(this.agregarSeccion(c.id, contest.id).catch(e => e))
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
          console.log('posteado', contest)
          if (resDesinscripcionesCategorias.find(r => r === false) == undefined && resDesinscripcionesSecciones.find(r => r === false) == undefined)
            this.router.navigate(['/concursos/', contest.id]);
        },
        async err => {
          this.posting = false;
          try {
            (await this.alertCtrl.create({
              header: 'Error',
              message: (err.error as []).map(e => (e as any).message).join('<br>'),
              buttons: [{
                text: 'Ok',
                role: 'cancel'
              }]
            })).present()
          } catch(e) {
            (await this.alertCtrl.create({
              header: 'Error',
              message: this.errorFilter(err.error['error-info'][2]),
              buttons: [{
                text: 'Ok',
                role: 'cancel'
              }]
            })).present()
          }
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
  async agregarCategoria(category_id: number, contest_id: number): Promise<ContestCategory> {
    return new Promise((resolve, reject) => {
      const model: ContestCategory = {
        contest_id,
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
          this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) })
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
              this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) })
              resolve(false)
            }
          )
          // }
        }, 
        async () => resolve(true)
      )
    })
  }
  async agregarSeccion(section_id: number, contest_id: number): Promise<ContestSection> {
    return new Promise((resolve, reject) => {
      const model: ContestSection = {
        contest_id,
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
          this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) })
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
              this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error['error-info'][2]) })
              resolve(false)
            }
          )
          // }
        }, 
        async () => resolve(true)
      )
    })
  }
  
      // https://medium.com/@danielimalmeida/creating-a-file-upload-component-with-angular-and-rxjs-c1781c5bdee
    // fileUpload(event: FileList) {
      imageUpload(event: EventTarget) {
      
        const file = (event as HTMLInputElement).files.item(0)
    
        if (!file) return;
    
        if (file.type.split('/')[0] !== 'image') { 
          console.log('File type is not supported!')
          return;
        }
    
        // this.isImgUploading = true;
        // this.isImgUploaded = false;
    
        // this.FileName = file.name;
        // console.log('uploaded', file)
        this.image_file = file
    
        const fileReader = new FileReader();
        const { type, name } = file;
        // return new Observable((observer: Observer<IUploadedFile>) => {
          // this.validateSize(file, observer);
          fileReader.readAsDataURL(file);
          fileReader.onload = event => {
    
            // if (this.isImage(type)) {
              const image = new Image();
              image.onload = (i) => {
                const imageData = (i.target as HTMLImageElement).src
                // this.imageData = imageData
                this.img_url = imageData
              };
              image.onerror = () => {
              };
              image.src = fileReader.result as string;
            }
    
      }
      // https://medium.com/@danielimalmeida/creating-a-file-upload-component-with-angular-and-rxjs-c1781c5bdee
    // fileUpload(event: FileList) {
      fileUpload(event: EventTarget) {
      
        const file = (event as HTMLInputElement).files.item(0)
    
        if (!file) return;
    
        if (file.type.split('/')[1] !== 'pdf') { 
          console.log('File type is not supported!')
          return;
        }
    
        // this.isImgUploading = true;
        // this.isImgUploaded = false;
    
        // this.FileName = file.name;
        // console.log('uploaded', file)
        this.rules_file = file
    
        const fileReader = new FileReader();
        const { type, name } = file;
        // console.log('file type', type)
        // return new Observable((observer: Observer<IUploadedFile>) => {
          // this.validateSize(file, observer);
          fileReader.readAsDataURL(file);
          fileReader.onload = event => {
    
            // if (this.isImage(type)) {
              // const blob = new Blob();
              // image.onload = (i) => {
              //   const imageData = (i.target as HTMLImageElement).src
              //   // this.imageData = imageData
              //   this.img_url = imageData
              // };
              // image.onerror = () => {
              // };
              this.rules_url = this.sanitizer.bypassSecurityTrustResourceUrl(fileReader.result as string);
              // console.log(this.rules_url)
            }
    
      }

}
