import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Contest } from 'src/app/models/contest.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestService } from 'src/app/services/profile-contest.service';

@Component({
  selector: 'app-inscribir-concursante',
  templateUrl: './inscribir-concursante.component.html',
  styleUrls: ['./inscribir-concursante.component.scss'],
})
export class InscribirConcursanteComponent implements OnInit {

  @Input() modalController: ModalController;
  @Input() contest: Contest;
  @Input() concursantes: ProfileExpanded;

  public profile_id: number = undefined;

  constructor(
    private profileContestService: ProfileContestService
  ) { }

  ngOnInit() {}

  datosCargados() {
    return this.profile_id != undefined
  }

  inscribirConcursante() {
    console.log('inscribiendo', this.profile_id, ' a ', this.contest.id)
    this.profileContestService.post({
      profile_id: this.profile_id,
      contest_id: this.contest.id
    })
  }

}
