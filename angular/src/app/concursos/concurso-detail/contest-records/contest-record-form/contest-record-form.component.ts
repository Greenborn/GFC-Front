import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ConfigService } from 'src/app/services/config/config.service';
import { ContestRecordService } from 'src/app/services/contest-record.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-contest-record-form',
  templateUrl: './contest-record-form.component.html',
  styleUrls: ['./contest-record-form.component.scss'],
})
export class ContestRecordFormComponent extends ApiConsumer implements OnInit {

  @Input() concurso: any;
  @Input() grabacion: any;
  @Input() modalController: ModalController;
  
  constructor(
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService,
    public UIUtilsService: UiUtilsService,
    private configService: ConfigService,
    private contestRecordService: ContestRecordService
  ) { 
    super(alertCtrl);
  }

  get formTitle() {
    return (this.grabacion.id === undefined ? 'Agregar grabación' : 'Editar grabación ');
  }

  ngOnInit() {}

  async guardar() {
    if (this.grabacion.object == '' || this.grabacion.object == undefined) {
      super.displayAlert('Es necesario definir un nombre');
      return false;
    }

    if (this.grabacion.url == '' || this.grabacion.url == undefined) {
      super.displayAlert('Es necesaria definir una url');
      return false;
    }

    await this.UIUtilsService.presentLoading();
    
    if (this.grabacion.id === undefined) {
      // Crear nuevo registro
      this.contestRecordService.post(this.grabacion).subscribe(
        response => { 
          super.displayAlert('Enlace de grabación guardado');
          this.UIUtilsService.dismissLoading();
          this.modalController.dismiss({ grabacion: response.data });
        },
        err => {
          this.UIUtilsService.dismissLoading();
          const errorMsg = err?.response?.data?.message || 'Error al guardar la grabación';
          super.displayAlert(errorMsg);
        }
      );
    } else {
      // Actualizar registro existente
      this.contestRecordService.put(this.grabacion, this.grabacion.id).subscribe(
        response => { 
          super.displayAlert('Enlace de grabación guardado');
          this.UIUtilsService.dismissLoading();
          this.modalController.dismiss({ grabacion: response.data });
        },
        err => {
          this.UIUtilsService.dismissLoading();
          const errorMsg = err?.response?.data?.message || 'Error al actualizar la grabación';
          super.displayAlert(errorMsg);
        }
      );
    }
  }
}
