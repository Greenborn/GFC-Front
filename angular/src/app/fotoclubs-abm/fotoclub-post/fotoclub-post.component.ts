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
    if (this.fotoclub === undefined) {
      this.fotoclub = this.fotoclubService.template;
    }
    this.img_url = this.fotoclub.photo_url ? this.configService.imageUrl(this.fotoclub.photo_url) : '';
    this.name = this.fotoclub.name;
  }

  datosCargados() {
    return ![undefined, ''].includes(this.fotoclub.name) && (this.name != undefined ? this.fotoclub.name != this.name : true)
  }

  async postFotoclub(form: NgForm) {
      if (form.valid) {
        this.posting = true
        const data = { ...form.value, id: this.fotoclub.id };
        this.fotoclubService.post(data, this.fotoclub.id).subscribe(
         async  fotoclub => {
            this.posting = false
            this.modalController.dismiss({ fotoclub })
          },
          err => {
            this.posting = false
            console.log('Error post fotoclub', err)
            this.UIUtilsService.mostrarError({ message: this.errorFilter(err.error) })
          });
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
