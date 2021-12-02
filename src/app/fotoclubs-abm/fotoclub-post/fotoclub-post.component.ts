import { Component, Input, OnInit } from '@angular/core';
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
  // public cont: number = 0;

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

  postFotoclub() {
    // if (this.cont < 1) {
    //   this.cont++
      const f: Fotoclub = {
        name: this.fotoclub.name
      }
      this.posting = true
      super.fetch<Fotoclub>(
        () => this.fotoclubService.post(f, this.fotoclub.id)
      ).subscribe(
        fotoclub => {
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
    // }
  }
}
