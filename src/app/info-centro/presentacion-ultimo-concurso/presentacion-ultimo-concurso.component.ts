import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { PublicContestService } from 'src/app/services/public.contest.service';

@Component({
  selector: 'app-presentacion-ultimo-concurso',
  templateUrl: './presentacion-ultimo-concurso.component.html',
  styleUrls: ['./presentacion-ultimo-concurso.component.scss'],
})
export class PresentacionUltimoConcursoComponent extends ApiConsumer implements OnInit {

  constructor(
    private publicContestService: PublicContestService,
    public  alertController:      AlertController,
  ) {
    super(alertController);
  }

  ngOnInit() {}

}
