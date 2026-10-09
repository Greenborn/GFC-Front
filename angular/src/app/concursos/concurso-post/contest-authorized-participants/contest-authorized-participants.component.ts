import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ContestAuthorizedParticipantsStatus } from 'src/app/models/contest_authorized_participant.model';
import { ContestAuthorizedParticipantService } from 'src/app/services/contest-authorized-participant.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { extractErrorMessage } from 'src/app/shared/error-utils';
import { ContestAuthorizedParticipantsPreviewComponent } from './contest-authorized-participants-preview/contest-authorized-participants-preview.component';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-contest-authorized-participants',
  templateUrl: './contest-authorized-participants.component.html',
  styleUrls: ['./contest-authorized-participants.component.scss'],
})
export class ContestAuthorizedParticipantsComponent implements OnChanges {
  @Input() concurso: any;

  status: ContestAuthorizedParticipantsStatus = { has_list: false, count: 0, uploaded_at: null };
  uploading: boolean = false;

  constructor(
    public UIUtilsService: UiUtilsService,
    private capService: ContestAuthorizedParticipantService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['concurso'] && this.concurso?.id) {
      this.loadStatus();
    }
  }

  loadStatus() {
    this.capService.getStatus(this.concurso.id).subscribe({
      next: s => this.status = s,
      error: () => this.status = { has_list: false, count: 0, uploaded_at: null }
    });
  }

  onFileSelected(eventTarget: EventTarget) {
    const file = (eventTarget as HTMLInputElement).files?.item(0);
    (eventTarget as HTMLInputElement).value = '';
    if (!file) return;

    this.uploading = true;
    this.capService.parseFile(this.concurso.id, file).subscribe({
      next: async result => {
        this.uploading = false;
        const data = await this.UIUtilsService.mostrarModal(
          ContestAuthorizedParticipantsPreviewComponent,
          { rows: result.rows, stats: result.stats },
          false,
          'authorized-participants-preview-dialog'
        );
        if (data?.confirmed) this.confirmImport(result.rows);
      },
      error: err => {
        this.uploading = false;
        this.UIUtilsService.mostrarError({ message: extractErrorMessage(err) });
      }
    });
  }

  confirmImport(rows: any[]) {
    this.capService.confirmImport(this.concurso.id, rows).subscribe({
      next: async () => {
        this.loadStatus();
        await this.UIUtilsService.mostrarToast(undefined, { message: 'Listado de participantes autorizados importado correctamente' });
      },
      error: err => {
        this.UIUtilsService.mostrarError({ message: extractErrorMessage(err) });
      }
    });
  }
}
