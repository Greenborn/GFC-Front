import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContest, ProfileContestExpanded } from 'src/app/models/profile_contest';
import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

@Component({
  selector: 'app-inscribir-jueces',
  templateUrl: './inscribir-jueces.component.html',
  styleUrls: ['./inscribir-jueces.component.scss'],
})
export class InscribirJuecesComponent extends ApiConsumer implements OnInit  {

  @Input() modalController: ModalController;
  @Input() contest: Contest;
  @Input() jueces: ProfileExpanded[];
  @Input() categorias: Category[];

  @Input() profileContest: ProfileContest = this.profileContestService.template;
  // @Input() profile_id: number = undefined;
  // @Input() category_id: number = undefined;
  public posting: boolean = false;

  // private cont: number = 0;

  constructor(
    alertCtrl: AlertController,
    private profileContestService: ProfileContestService,
    public responsiveService: ResponsiveService
  ) { 
    super(alertCtrl)
  }

  ngOnInit() {}

  datosCargados() {
    return this.profileContest.profile_id != undefined
  }

  inscribirJuez() {
    if (this.datosCargados()) {
      // if (this.cont < 1) {
      //   this.cont++
        console.log('inscribiendo', this.profileContest.profile_id, ' a ', this.contest.id)
        this.posting = true
        const s = this.profileContestService.post({
            profile_id: this.profileContest.profile_id,
            contest_id: this.contest.id,
            category_id: this.profileContest.category_id
          }, undefined, 'expand=profile,profile.user,profile.fotoclub,category'
        ).subscribe(
          profileContest => {
            this.posting = false
            this.modalController.dismiss({ profileContest })
          },
          err => {
            console.log('error inscripcion juez', err)
            super.displayAlert(err.error['error-info'])
          },
          () => {
            // console.log('unsubsssss')
            s.unsubscribe()
          }
        )
      // }
      // super.fetch<ProfileContestExpanded>(() => this.profileContestService.post({
      //     profile_id: this.profileContest.profile_id,
      //     contest_id: this.contest.id,
      //     category_id: this.profileContest.category_id
      //   }, undefined, 'expand=profile,profile.user,profile.fotoclub,category'
      // )).subscribe(
      //   profileContest => {
      //     this.posting = false
      //     this.modalController.dismiss({ profileContest })
      //   },
      //   err => {
      //     console.log('error inscripcion concursante', err)
      //     super.displayAlert(err.error['error-info'][2])
      //   }
      // )
    }
    
  }


}
