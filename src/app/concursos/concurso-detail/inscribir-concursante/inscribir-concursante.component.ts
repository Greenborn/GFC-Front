import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContest, ProfileContestExpanded } from 'src/app/models/profile_contest';
import { ProfileContestService } from 'src/app/services/profile-contest.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
// import { IonicSelectableComponent } from 'ionic-selectable';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-inscribir-concursante',
  templateUrl: './inscribir-concursante.component.html',
  styleUrls: ['./inscribir-concursante.component.scss'],
})
export class InscribirConcursanteComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() contest: Contest;
  @Input() concursantes: any[];
  @Input() categorias: Category[];
  @Input() profileContest: ProfileContest = this.profileContestService.template;

  public posting: boolean = false;

  constructor(
    alertCtrl: AlertController,
    private profileContestService: ProfileContestService,
    public responsiveService: ResponsiveService,
    private rolificador: RolificadorService,
    private authService: AuthService
  ) { 
    super(alertCtrl)
  }

  ngOnInit() {
    console.log("inicio modal", this.concursantes)
    //modificacion datos de concursantes para concatenar nombre y apellido
    for (let c=0; c<this.concursantes.length; c++){
      this.concursantes[c].name = this.concursantes[c].name + ' ' + this.concursantes[c].last_name;
    }
    
   if(this.concursantes.length == 1) {
    this.profileContest.profile_id = this.concursantes[0].id
   }
  }

  datosCargados() {
    // console.log("completado form: ", this.profileContest.profile_id, this.profileContest.profile_id != undefined,  this.profileContest.category_id)
    return this.profileContest.profile_id != undefined && 
              this.profileContest.category_id != undefined
  }

  async inscribirConcursante() {
    if (this.datosCargados()) {
      // console.log("concursantes: ", this.concursantes[0].id)
      if(!this.rolificador.esConcursante(await this.authService.user) ){
        this.profileContest.profile_id = Number(this.profileContest.profile_id['id']); // Agregado por cambio en select
      } else {
        this.profileContest.profile_id = this.concursantes[0].id
      }

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
            console.log('error inscripcion concursante', err)
            super.displayAlert(this.errorFilter(err.error.message))
          },
          () => {
            // console.log('unsubsssss')
            s.unsubscribe()
          }
        )
  
    }
    
  }

}
