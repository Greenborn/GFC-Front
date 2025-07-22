import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { InfoCentro } from 'src/app/models/info_centro.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { InfoCentroService } from 'src/app/services/info-centro.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-info-centro-post',
  templateUrl: './info-centro-post.component.html',
  styleUrls: ['./info-centro-post.component.scss'],
})
export class InfoCentroPostComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() parrafo: InfoCentro;

  public image_file: File;
  public img_url: string;
  public posting: boolean = false
  public loadedImg: boolean = false

  constructor(
    alertCtrl: AlertController,
    private infoCentroService: InfoCentroService,
    public responsiveService: ResponsiveService,
    public UIUtilsService: UiUtilsService,
    private configService: ConfigService
  ) { 
    super(alertCtrl)
  }



  get formTitle() {
    return (this.parrafo.id === undefined ? 'Agregar parrafo' : 'Editar ' + (this.parrafo.id == 1 ? 'encabezado ' : 'parrafo'))
  }

  ngOnInit() {
    if (this.parrafo === undefined) {
      this.parrafo = this.infoCentroService.template
    } else {
      this.img_url = this.configService.imageUrl(this.parrafo.img_url)
    }
  }

  datosCargados() {
    return true
    // return ![undefined, ''].includes(this.parrafo.title) ||
    //        ![undefined, ''].includes(this.parrafo.content) || 
    //        this.image_file != undefined
  }

  loadImg(ev) {
    // console.log(ev.target.src)
    this.loadedImg = true
  }
  deleteImg(inputFile) {
    if (this.image_file != undefined) {
      this.image_file = undefined
      inputFile.el.value = undefined
      if (this.parrafo === undefined) {
        this.img_url = undefined
        this.loadedImg = false
      } else {
        this.img_url = this.configService.imageUrl(this.parrafo.img_url)
      }
    } else {
      this.parrafo.img_url = ''
      this.img_url = ''
      this.loadedImg = false
    }
  }

  postParrafo() {
      const p: any = {
        title: this.parrafo.title,
        content: this.parrafo.content
      }
      if (this.image_file != undefined) {
        p.image_file = this.image_file
      } else if (this.parrafo.img_url == '') {
        p.delete_img = true
      }
      this.posting = true
      super.fetch<any>(
        () => this.infoCentroService.postFormData<any>(p, this.parrafo.id)
      ).subscribe(
        parrafo => {
          this.posting = false
          this.modalController.dismiss({ parrafo })
          console.log('posted parrafo', parrafo)
        },
        err => {
          this.posting = false
          console.log('Error post parrafo', err)
          this.UIUtilsService.mostrarError({ message: err.error })
        }
      )
  }

  imageUpload(event) {
      
    const file = (event as HTMLInputElement).files.item(0)

    if (!file) {
      console.log(event.target.value)
      return
    };

    if (file.type.split('/')[0] !== 'image') { 
      console.log('File type is not supported!')
      return;
    }
    this.image_file = file

    const fileReader = new FileReader();
    const { type, name } = file;
    fileReader.readAsDataURL(file);
    fileReader.onload = event => {
      const image = new Image();
      image.onload = (i) => {
        const imageData = (i.target as HTMLImageElement).src
        this.img_url = imageData
      };
      image.onerror = () => {};
      image.src = fileReader.result as string;
    }

  }
}
