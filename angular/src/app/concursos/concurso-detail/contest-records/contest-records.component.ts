import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { LoadingService } from 'src/app/services/ui/loading.service';
import { ContestRecordService } from 'src/app/services/contest-record.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { ContestRecordFormComponent } from './contest-record-form/contest-record-form.component';
import { ContestRecord } from './models/contest.record';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-contest-records',
  templateUrl: './contest-records.component.html',
  styleUrls: ['./contest-records.component.scss'],
})
export class ContestRecordsComponent extends ApiConsumer implements OnInit, OnChanges {
  @Input() concurso: any;

  constructor(
    public UIUtilsService: UiUtilsService,
    alertCtrl: AlertService,
    public loadingService: LoadingService,
    private contestRecordService: ContestRecordService
  ) { 
    super(alertCtrl);
  }

  ngOnInit() {
    this.loadContestRecords();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['concurso'] && this.concurso?.id) {
      this.loadContestRecords();
    }
  }

  loadContestRecords() {
    if (!this.concurso?.id) return;

    this.contestRecordService.getAll({ 
      contestId: this.concurso.id,
      perPage: 100 
    }).subscribe({
      next: response => {
        // La API Node.js devuelve { items: [], _meta: {} }
        this.concurso.contestRecords = response.items || [];
      },
      error: err => {
        console.error('Error al cargar contest records:', err);
        this.concurso.contestRecords = [];
      }
    });
  }

  async addGrabacion() {
    let record: ContestRecord = new ContestRecord();
    record.contest_id = this.concurso.id;
    const result = await this.UIUtilsService.mostrarModal(ContestRecordFormComponent, { grabacion: record });
    if (result?.grabacion) {
      this.loadContestRecords();
    }
  }

  async editarGrabacion(model) {
    let record: ContestRecord = new ContestRecord();
    record.object = model.object;
    record.url = model.url;
    record.id = model.id;
    record.contest_id = this.concurso.id;
    const result = await this.UIUtilsService.mostrarModal(ContestRecordFormComponent, { grabacion: record });
    if (result?.grabacion) {
      this.loadContestRecords();
    }
  }

  async eliminarGrabacion(grabacion) {
    await this.loadingService.present('Borrando grabación');
    this.contestRecordService.delete(grabacion.id).subscribe({
      next: ok => {
        this.loadingService.dismiss();
        this.displayAlert('Grabación eliminada exitosamente');
        this.loadContestRecords();
      },
      error: err => {
        this.loadingService.dismiss();
        const errorMsg = err?.response?.data?.message || 'Ocurrió un error al intentar eliminar la grabación';
        this.displayAlert(errorMsg);
      }
    });
  }
}
