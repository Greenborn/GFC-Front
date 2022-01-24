import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ContestResultExpanded } from 'src/app/models/contest_result.model';
import { ContestSectionExpanded } from 'src/app/models/contest_section.model';
import { Image as GFC_Image } from 'src/app/models/image.model';
import { Profile } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';
import { ConfigService } from 'src/app/services/config/config.service';

import { ImageService } from 'src/app/services/image.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConcursoDetailService } from '../concurso-detail.service';

export interface ImagePostParams {
  image?: GFC_Image;
  section_id?: number;
  category_id?: number;
  section_max?: number;
  resultados?: ContestResultExpanded[];
}

@Component({
  selector: 'app-image-post',
  templateUrl: './image-post.page.html',
  styleUrls: ['./image-post.page.scss'],
})
export class ImagePostPage extends ApiConsumer implements OnInit {

  @Input() concurso: string;
  @Input() section_max: number;
  @Input() resultados: ContestResultExpanded[];
  @Input() concurso_id: number;
  @Input() modalController: ModalController;
  @Input() image: GFC_Image = this.imageService.template;
  @Input() profiles: ProfileContestExpanded[];
  @Input() secciones: Section[];

  @Input() section_id: number = undefined;
  

  @ViewChild('profileSelect') profileSelect: IonicSelectableComponent;
  public file: File;
  public imageData: string = '';
  public cont: number = 0;
  perfil_elegido: Profile = this.ProfileService.template;
  texto_img: string = null;
  texto_sec: string = null;
  sectionPos = false;
  
  seccionesInscriptas: ContestSectionExpanded[] = [];

  // public profiles: Profile[];
  public posting: boolean = false; 
  public img_url = '';
  public profiles_list:any = {};
  profile: ProfileContestExpanded[];

  constructor(
    private imageService: ImageService,
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService,
    public concursoDetailService: ConcursoDetailService,
    public ProfileService: ProfileService,
    private configService: ConfigService
  ) { 
    super(alertCtrl)
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
    return this.imageData != '' ? this.imageData : this.configService.apiUrl(this.image.url);
  }

  async ngOnInit() {
    this.concursoDetailService.seccionesInscriptas.subscribe(cs => this.seccionesInscriptas = cs);
    this.img_url = this.image.url;
    
    //modificacion datos de concursantes para concatenar nombre y apellido
    this.profiles_list = [];
    for (let c=0; c<this.profiles.length; c++){
      this.profiles_list.push({ name:this.profiles[c].profile.name + ' ' + this.profiles[c].profile.last_name, id:this.profiles[c].profile.id });   
    }
    this.perfil_elegido = this.profiles_list.find(e => e.id == this.image.profile_id);

    if(this.profiles_list.length == 1) {
      this.profile = this.profiles_list[0].name
      this.image.profile_id = this.profiles_list[0].id
      // console.log ("hay uno", this.profiles_list[0].name)
     }
  }

  async postImage() {
    
    if (this.datosCargados()) {
   
           this.posting = true
           let i: GFC_Image;
           const model: any = {
             title: this.image.title,
             code: this.code,
             profile_id:  this.profiles_list.length != 1 ? this.perfil_elegido['id'] : this.image.profile_id
           }
           if (this.file != undefined) {
             model.image_file = this.file
           }
          //hacer que agarre bien al usuario TODO:
          this.imageService.postFormData<any>(model, this.image.id).subscribe(
             // image => this.dismiss(image),
             image => {
               this.posting = false
               i = image
               this.dismiss(i, this.section_id)
             },
             async err => {
               super.displayAlert(err.error['message'])
               this.posting = false
             },
            
           );
    }
  }

  datosCargados() {
    //return this.image.code !=  undefined 
    return this.image.title !=  undefined 
        && (this.image.profile_id != undefined || this.perfil_elegido != undefined )
        && (this.section_id != undefined && this.sectionSelect != false) 
        && this.imgSource.split('/').pop() != 'undefined'
  }
  
  dismiss(image: GFC_Image = undefined, section_id: number) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
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

    let profile = this.profiles_list.length != 1 ? this.perfil_elegido['id'] : this.image.profile_id
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

  // https://medium.com/@danielimalmeida/creating-a-file-upload-component-with-angular-and-rxjs-c1781c5bdee
  fileUpload(event: EventTarget) {
    this.texto_img = null;
      
    const file = (event as HTMLInputElement).files.item(0)

    if (!file) return;
    
    if (file.type.split('/')[0] !== 'image' || (file.name.split('.').pop().toLowerCase() != 'jpg' && file.name.split('.').pop().toLowerCase() != 'jpeg')) { 
      console.log('File type is not supported!')
      // this.img_acept = false
      this.texto_img = "Extención no admitida, suba .JPEG ó .JPG"
      this.file = undefined;
      this.imageData = '';
      return;
    }

    if(file.size > 2e+6) {
      this.texto_img = "El peso máximo admitido para la fotografía es de 2MB"
      this.file = undefined;
      this.imageData = '';
      return;
    }

    this.file = file

    const fileReader = new FileReader();
    const { type, name } = file;

    fileReader.readAsDataURL(file);
    fileReader.onload = event => {

        const image = new Image();
        image.onload = (i) => {
              const imageData = (i.target as HTMLImageElement).src
              this.imageData = imageData;
        };
        image.onerror = () => {
              // observer.error({ error: { name, errorMessage: INVALID_IMAGE } });
        };
        image.src = fileReader.result as string;

    }

    const fileStoragePath = `uploads/images/${new Date().getTime()}_${file.name}`;

  }
}
