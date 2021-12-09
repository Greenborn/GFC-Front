import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Image as GFC_Image } from 'src/app/models/image.model';
import { Profile } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { Section } from 'src/app/models/section.model';
import { ConfigService } from 'src/app/services/config/config.service';

import { ImageService } from 'src/app/services/image.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

export interface ImagePostParams {
  image?: GFC_Image;
  section_id?: number;
  category_id?: number;
}

@Component({
  selector: 'app-image-post',
  templateUrl: './image-post.page.html',
  styleUrls: ['./image-post.page.scss'],
})
export class ImagePostPage extends ApiConsumer implements OnInit {

  @Input() concurso: string;
  @Input() concurso_id: number;
  @Input() modalController: ModalController;
  // @Input() contestResult: ContestResult;
  @Input() image: GFC_Image = this.imageService.template;
  @Input() profiles: ProfileContestExpanded[];
  @Input() secciones: Section[];

  @Input() section_id: number = undefined;
  
  // @ViewChild('s') selectConcursante: ElementRef;
  // @ViewChild('formImage') formImage: HTMLFormElement;
  // private cont: number = 0;
  @ViewChild('profileSelect') profileSelect: IonicSelectableComponent;
  public file: File;
  public imageData: string = '';

  // public profiles: Profile[];
  public posting: boolean = false; 
  public img_url = '';
  public profiles_list:any = {};

  constructor(
    // private userSvc: UsuarioService,
    // private contestSvc: ConcursoService,
    private imageService: ImageService,
    // private profileService: ProfileService,
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService,
    private configService: ConfigService
  ) { 
    super(alertCtrl)
  }

  get categoryId(): number {
    const p = this.profiles.find(p => p.profile_id == this.image.profile_id)
    return p != undefined ? p.category_id : undefined
  }
  get code(): string {
    // return `${(this.concurso ?? '').replace(/ /g, '_').toLowerCase().normalize()}-c${this.categoryId ?? ''}s${this.section_id ?? ''}p${this.image.profile_id ?? ''}-`
    return `${this.concurso_id}-c${this.categoryId ?? ''}s${this.section_id ?? ''}p${this.image.profile_id ?? ''}-`
    // return `#c${this.categoryId ?? ''}s${this.section_id ?? ''}p${this.image.profile_id ?? ''}-${(this.image.title ?? '').replace(/ /g, '_').toLowerCase().normalize()}`
  }

  get formTitle(): string {
    return (this.image.id != undefined ? 'Editar' : 'Agregar') + ` imagen a ${this.concurso}`
  }

  get imgSource(): string {
    return this.imageData != '' ? this.imageData : this.configService.apiUrl(this.image.url)
  }

  async ngOnInit() {
    this.img_url = this.image.url
    // window.onresize = this.actualizarWidth;
    //modificacion datos de concursantes para concatenar nombre y apellido
    this.profiles_list = [];
    for (let c=0; c<this.profiles.length; c++){
      this.profiles_list.push({ name:this.profiles[c].profile.name + ' ' + this.profiles[c].profile.last_name, id:this.profiles[c].profile.id });
    }
  }

  async postImage() {
    if (this.datosCargados()) {
      this.image.profile_id = this.image.profile_id['id'];
      // if (this.cont < 1) {
      //   this.cont++
        // setTimeout(() => this.cont = 0, 500)
        // console.log({
        //   ...this.formImage.value,
        //   profile_id: this.selectConcursante.value
        // })
        // const id = await this.contestSvc.postImage({
        //   id: this.image.id,
        //   ...f.value,
        //   profile_id: this.selectConcursante.value
        // })
        this.posting = true
        let i: GFC_Image;
        const model: any = {
          title: this.image.title,
          code: this.code,
          profile_id: this.image.profile_id
        }
        if (this.file != undefined) {
          model.image_file = this.file
        }
        console.log('posting', model)
        // super.fetch<GFC_Image>(() =>
        super.fetch<any>(() =>
          this.imageService.postFormData<any>(model, this.image.id)
        ).subscribe(
          // image => this.dismiss(image),
          image => {
            console.log('posted ', image)
            this.posting = false
            i = image
            this.dismiss(i, this.section_id)
          },
          async err => {
            super.displayAlert(err.error['message'])
            this.posting = false
          },
          // () => { // on complete.. pero no cacha el error
          //   console.log(i)
          //   this.posting = false
            
          // })
        )
        // console.log('posted img con id', id)
        // this.dismiss(id)
      // }
    }
  }

  datosCargados() {
    //return this.image.code !=  undefined 
    return this.image.title !=  undefined 
        && this.image.profile_id != undefined
        && this.section_id != undefined
  }
  
  dismiss(image: GFC_Image = undefined, section_id: number) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      image,
      section_id
    });
  }

  // https://medium.com/@danielimalmeida/creating-a-file-upload-component-with-angular-and-rxjs-c1781c5bdee
  fileUpload(event: EventTarget) {
      
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
    this.file = file

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
            this.imageData = imageData
            // console.log('loaded image', imageData)
            // observer.next({ file });
            // observer.complete();
          };
          image.onerror = () => {
            // observer.error({ error: { name, errorMessage: INVALID_IMAGE } });
          };
          image.src = fileReader.result as string;
        // } else {
          // observer.next({ file });
          // observer.complete();
        }
      // };

    const fileStoragePath = `uploads/images/${new Date().getTime()}_${file.name}`;

    // const imageRef = this.angularFireStorage.ref(fileStoragePath);

    // this.ngFireUploadTask = this.angularFireStorage.upload(fileStoragePath, file);

    // this.progressNum = this.ngFireUploadTask.percentageChanges();
    // this.progressSnapshot = this.ngFireUploadTask.snapshotChanges().pipe(
      
      // finalize(() => {
      //   this.fileUploadedPath = imageRef.getDownloadURL();
        
      //   this.fileUploadedPath.subscribe(resp=>{
      //     this.fileStorage({
      //       name: file.name,
      //       filepath: resp,
      //       size: this.FileSize
      //     });
      //     this.isImgUploading = false;
      //     this.isImgUploaded = true;
      //   },error => {
      //     console.log(error);
      //   })
      // }),
      // tap(snap => {
      //     this.FileSize = snap.totalBytes;
      // })
    // )
  }
}
