import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-fotoclub-post',
  templateUrl: './fotoclub-post.component.html',
  styleUrls: ['./fotoclub-post.component.scss'],
})
export class FotoclubPostComponent extends ApiConsumer implements OnInit {
  @Input() modalController: ModalController;
  @Input() fotoclub: Fotoclub;

  public posting: boolean = false
  public name: string;
  public cont: number = 0;
  descrChangeFocus: boolean = false;
  
  public image_file: File;
  public img_url: string = '';

  constructor(
    alertCtrl: AlertController,
    private fotoclubService: FotoclubService,
    public responsiveService: ResponsiveService,
    public UIUtilsService: UiUtilsService
  ) { 
    super(alertCtrl)
  }

  get formTitle() {
    return (this.fotoclub.id === undefined ? 'Agregar organización' : 'Editar organización ' + this.name)
  }

  ngOnInit() {
    if (this.fotoclub === undefined) {
      this.fotoclub = this.fotoclubService.template
    } else {
      this.name = this.fotoclub.name
    }
  }

  datosCargados() {
    return ![undefined, ''].includes(this.fotoclub.name) && (this.name != undefined ? this.fotoclub.name != this.name : true)
  }

  async postFotoclub(form: NgForm) {
    if (this.cont < 1) {
      this.cont++
      if (form.valid) {

        const f = {
         ...form.value
        }
        if (this.image_file != undefined) {
         f.image_file = this.image_file
        }
        this.posting = true
        super.fetch<any>(
          () => this.fotoclubService.post(f, this.fotoclub.id)
        ).subscribe(
         async  fotoclub => {
            this.posting = false
            // this.cont--
            this.modalController.dismiss({ fotoclub })
          },
          err => {
            this.posting = false
            // this.cont--
            console.log('Error post fotoclub', err)
            this.UIUtilsService.mostrarError({ message: err.error })
          }
        )
      }
    }
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
}
