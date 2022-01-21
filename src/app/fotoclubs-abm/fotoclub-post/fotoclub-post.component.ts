import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController, AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ConfigService } from 'src/app/services/config/config.service';
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
    public UIUtilsService: UiUtilsService,
    private configService: ConfigService
  ) { 
    super(alertCtrl)
  }

  get formTitle() {
    return (this.fotoclub.id === undefined ? 'Agregar organización' : 'Editar organización ' + this.name)
  }

  ngOnInit() {
    this.img_url = this.configService.data.apiBaseUrl + this.fotoclub.photo_url;
    console.log(this.img_url);
    if (this.fotoclub === undefined) {
      this.fotoclub = this.fotoclubService.template
    } else {
      this.name = this.fotoclub.name;
    }
  }

  datosCargados() {
    return ![undefined, ''].includes(this.fotoclub.name) && (this.name != undefined ? this.fotoclub.name != this.name : true)
  }

  async postFotoclub(form: NgForm) {
    if (this.cont < 1) {
      this.cont++
      if (form.valid) {
        this.posting = true
        this.fotoclubService.post(this.fotoclub, this.fotoclub.id).subscribe(
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
          });
      }
    }
  }

  handleFileInput(files: FileList) {
    let me     = this;
    let file   = files[0];
    let reader = new FileReader();
   
    reader.readAsDataURL(file);
    reader.onload = function () {
        me.fotoclub.photo_base64 = { file: reader.result, name:file.name};
        console.log(me.fotoclub.photo_base64);
        me.img_url = me.fotoclub.photo_base64.file;
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
      return false;
    };
  }

}
