import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Contest } from 'src/app/models/contest.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContestExpanded } from 'src/app/models/profile_contest';
import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

@Component({
  selector: 'app-inscribir-concursante',
  templateUrl: './inscribir-concursante.component.html',
  styleUrls: ['./inscribir-concursante.component.scss'],
})
export class InscribirConcursanteComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() contest: Contest;
  @Input() concursantes: ProfileExpanded[];

  public profile_id: number = undefined;
  public posting: boolean = false;

  constructor(
    alertCtrl: AlertController,
    private profileContestService: ProfileContestService,
    public responsiveService: ResponsiveService
  ) { 
    super(alertCtrl)
  }

  ngOnInit() {}

  datosCargados() {
    return this.profile_id != undefined
  }

  inscribirConcursante() {
    console.log('inscribiendo', this.profile_id, ' a ', this.contest.id)
    this.posting = true
    super.fetch<ProfileContestExpanded>(() => this.profileContestService.post({
        profile_id: this.profile_id,
        contest_id: this.contest.id,
        category_id: undefined // TODO: FALTAN ATRIBUTOS
      }, undefined, 'expand=profile,profile.user,profile.fotoclub'
    )).subscribe(
      profileContest => {
        this.posting = false
        this.modalController.dismiss({ profileContest })
      },
      err => {
        console.log('error inscripcion concursante', err)
        super.displayAlert(err.error['error-info'][2])
      }
    )
    
  }

}
