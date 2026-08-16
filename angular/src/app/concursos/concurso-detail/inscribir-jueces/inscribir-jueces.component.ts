import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Category } from 'src/app/models/category.model';
import { Contest } from 'src/app/models/contest.model';
import { ProfileExpanded } from 'src/app/models/profile.model';
import { ProfileContest } from 'src/app/models/profile_contest';
import { ContestJudgeService } from 'src/app/services/contest-judge.service';
import { UserService } from 'src/app/services/user.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { AlertService } from 'src/app/services/ui/alert.service';
import { BtnPostComponent } from 'src/app/shared/btn-post/btn-post.component';
import { extractErrorMessage } from 'src/app/shared/error-utils';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, BtnPostComponent],
  selector: 'app-inscribir-jueces',
  templateUrl: './inscribir-jueces.component.html',
  styleUrls: ['./inscribir-jueces.component.scss'],
})
export class InscribirJuecesComponent extends ApiConsumer implements OnInit  {

  @Input() modalController: any;
  @Input() contest: Contest;
  @Input() jueces: ProfileExpanded[];
  @Input() categorias: Category[];

  @Input() profileContest: ProfileContest;
  public posting: boolean = false;

  private userIdByProfile: Record<number, number> = {};

  constructor(
    alertService: AlertService,
    private contestJudgeService: ContestJudgeService,
    private userService: UserService,
    public responsiveService: ResponsiveService
  ) { 
    super(alertService)
    this.profileContest = {
      id: undefined,
      profile_id: undefined,
      contest_id: undefined,
      category_id: undefined
    }
  }

  ngOnInit() {
    this.userService.getAllPaged({ perPage: 1000, filters: { role_id: '4' } }).subscribe({
      next: res => {
        const items = res?.items || [];
        for (const u of items) {
          if (u?.profile_id != null && u?.id != null) {
            this.userIdByProfile[u.profile_id] = u.id;
          }
        }
      }
    });
  }

  datosCargados() {
    return this.profileContest.profile_id != undefined
  }

  inscribirJuez() {
    if (this.datosCargados()) {

        const user_id = this.userIdByProfile[this.profileContest.profile_id];
        if (user_id == undefined) {
          super.displayAlert('No se pudo determinar el usuario del juez seleccionado')
          return
        }

        this.posting = true
        const s = this.contestJudgeService.post({
            user_id,
            contest_id: this.contest.id,
          }
        ).subscribe(
          async contestJudge => {
            this.posting = false
            try { await this.modalController.dismiss({ contestJudge }); } catch {}
          },
          err => {
            this.posting = false
            super.displayAlert(extractErrorMessage(err))
          },
          () => {
            s.unsubscribe()
          }
        );

    }
    
  }


}
