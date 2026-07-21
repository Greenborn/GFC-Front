import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Image as GFC_Image } from 'src/app/models/image.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';
import { ConfigService } from 'src/app/services/config/config.service';

import { ImageService } from 'src/app/services/image.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConcursoDetailService } from '../concurso-detail.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

export interface ImagePostParams {
  image?: GFC_Image;
  section_id?: number;
  category_id?: number;
  section_max?: number;
  resultados?: ContestResultExpanded[];
  photo_base64?: any;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-image-post',
  templateUrl: './image-post.page.html',
  styleUrls: ['./image-post.page.scss'],
})
export class ImagePostPage extends ApiConsumer implements OnInit {

  @Input() concurso: string;
  @Input() section_max: number;
  @Input() resultados: any;
  @Input() concurso_id: number;
  @Input() modalController: any;
  @Input() image: GFC_Image;
  @Input() profiles: ProfileContestExpanded[];
  @Input() secciones: Section[];

  @Input() section_id: number = undefined;

  public file: File;
  public imageData: string = '';
  public cont: number = 0;
  public photo_base64:any;
  texto_img: string = null;
  texto_sec: string = null;
  sectionPos = false;
  
  seccionesInscriptas: ContestSectionExpanded[] = [];

  public posting: boolean = false; 
  public img_url = '';

  constructor(
    private imageService: ImageService,
    alertService: AlertService,
    public responsiveService: ResponsiveService,
    public concursoDetailService: ConcursoDetailService,
    private configService: ConfigService,
    private authService: AuthService
  ) { 
    super(alertService);
    this.image = this.imageService.template;
  }

  get categoryId(): number {
    const p = this.profiles.find(p => p.profile_id == this.image.profile_id);
    return p != undefined ? p.category_id : undefined;
  }
  get code(): string {
    return `Co${this.concurso_id}Ca${this.categoryId ?? ''}S${this.section_id ?? ''}-`;
  }

  get formTitle(): string {
    return (this.image.id != undefined ? 'Editar' : 'Agregar') + ` imagen a ${this.concurso}`;
  }

  get imgSource(): string {
    return this.imageData != '' ? this.imageData : this.configService.imageUrl(this.image.url);
  }

  async ngOnInit() {
    this.concursoDetailService.seccionesInscriptas.subscribe(cs => this.seccionesInscriptas = cs);
    this.img_url = this.image.url;

    if (this.image.id == undefined) {
      const user = await this.authService.user;
      this.image.profile_id = user?.profile_id;
    }
  }

  async postImage() {
    
    if (this.datosCargados()) {
   
           this.posting = true
            let i: GFC_Image;
             const model: any = {
               title: this.image.title,
               code: this.code,
               photo_base64:this.photo_base64,
               url:'_',
               profile_id: this.image.profile_id
             }
           this.imageService.post<any>(model, this.image.id).subscribe(
             // image => this.dismiss(image),
             image => {
               this.posting = false
               i = image
               this.dismiss(i, this.section_id)
             },
              async err => {
                super.displayAlert(this.errorFilter(err.error?.message || err.error?.['error-info']?.[2] || err.message))
                this.posting = false
              },
            
           );
    }
  }

  datosCargados() {
    const tieneImagen = this.imageData != '' || (this.image?.url != null && this.image?.url != undefined && this.image?.url != '');
    return this.image.title != undefined
        && this.image.title?.trim() != ''
        && this.image.profile_id != undefined
        && this.section_id != undefined && this.section_id != null
        && this.sectionSelect != false
        && tieneImagen
  }
  
  dismiss(image: GFC_Image = undefined, section_id: number) {
    this.modalController.dismiss({
      image,
      section_id
    });
  }

  get sectionSelect(){
    this.sectionPos = true;
    this.texto_sec = null;
    let cantSec = 0;
    let secOrigin = null;

    let profile = this.image.profile_id
    this.resultados.forEach(e => {
      if (e.image.profile_id == profile && e.section_id == this.section_id){
        cantSec++
      }
      if(e.image.id == this.image.id ){
        secOrigin = e.section_id
      }
    })
    if (this.formTitle.includes('Editar') == true && secOrigin == this.section_id){
      cantSec-- //porque siendo edición puede dejar la imagen en la misma sección o en otra
    }
    //  cantidad actual de fotos en esa seccion + cantidad máx por seccion de concurso 
    if (cantSec >= this.section_max){
      // this.section_id = undefined;
      this.sectionPos = false;
      this.texto_sec = "Ya ha subido el máximo de Fotografías para esta sección"
      return false
    }
    return true
  }

  handleFileInput(files: FileList) {
    let me     = this;
    let file   = files[0];
    let reader = new FileReader();

    this.texto_img = null;
   
    if (!file) return;

    if(file.size > (1024 * 1024 * 50)) {
      this.texto_img = "El peso máximo admitido para la fotografía es de 50MB"
      this.file = undefined;
      this.imageData = '';
      return;
    }

    if (file.type.split('/')[0] !== 'image' || (file.name.split('.').pop().toLowerCase() != 'jpg' && file.name.split('.').pop().toLowerCase() != 'jpeg')) { 
      // this.img_acept = false
      this.texto_img = "Extención no admitida, suba .JPEG ó .JPG"
      this.file = undefined;
      this.imageData = '';
      return;
    }

    this.file = file;

    reader.readAsDataURL(file);
    reader.onload = function (i) {
        me.photo_base64 = { file: reader.result, name:file.name};
        me.img_url = me.photo_base64.file;
        me.imageData =  me.img_url;
    };
    reader.onerror = function (error) {
      return false;
    };
  }

}
