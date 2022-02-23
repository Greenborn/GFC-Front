import { Component, Input, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ContestRecordService } from 'src/app/services/contest-record.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ContestRecordFormComponent } from './contest-record-form/contest-record-form.component';
import { ContestRecord } from './models/contest.record';

@Component({
  selector: 'app-contest-records',
  templateUrl: './contest-records.component.html',
  styleUrls: ['./contest-records.component.scss'],
})
export class ContestRecordsComponent extends ApiConsumer implements OnInit {
  @Input() concurso:any;

  constructor(
    public UIUtilsService: UiUtilsService,
    alertCtrl:                    AlertController,
    public loadingController: LoadingController,
    private contestRecordService: ContestRecordService
  ) { 
    super(alertCtrl);
  }

  ngOnInit() {}

  async addGrabacion(){
    let record:ContestRecord = new ContestRecord();
    record.contest_id = this.concurso.id;
    const { grabacion } = await this.UIUtilsService.mostrarModal(ContestRecordFormComponent, { grabacion: record });
  }

  async editarGrabacion(model){
    let record:ContestRecord = new ContestRecord();
    record.object     = model.object;
    record.url        = model.url;
    record.id         = model.id;
    record.contest_id = this.concurso.id;
    const { grabacion } = await this.UIUtilsService.mostrarModal(ContestRecordFormComponent, { grabacion: record });
  }

  async eliminarGrabacion(grabacion){
    const loading = await this.loadingController.create({ message: 'Borrando grabación' });
    await loading.present();
    this.contestRecordService.delete(grabacion.id).subscribe(
      ok => {
        loading.dismiss();
        document.location.reload();
      },
      err => {
        loading.dismiss();
        this.displayAlert('Ocurrió un error al intentar eliminar la grabación');
      }
    );
  }
}
