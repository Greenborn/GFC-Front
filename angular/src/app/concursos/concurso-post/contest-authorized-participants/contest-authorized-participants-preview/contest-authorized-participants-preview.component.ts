import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  ContestAuthorizedParticipant,
  ContestAuthorizedParticipantsParseStats
} from 'src/app/models/contest_authorized_participant.model';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-contest-authorized-participants-preview',
  templateUrl: './contest-authorized-participants-preview.component.html',
  styleUrls: ['./contest-authorized-participants-preview.component.scss'],
})
export class ContestAuthorizedParticipantsPreviewComponent {
  @Input() rows: ContestAuthorizedParticipant[] = [];
  @Input() stats: ContestAuthorizedParticipantsParseStats;
  @Input() modalController: any;

  cancelar() {
    this.modalController.dismiss({ confirmed: false });
  }

  confirmar() {
    this.modalController.dismiss({ confirmed: true });
  }
}
