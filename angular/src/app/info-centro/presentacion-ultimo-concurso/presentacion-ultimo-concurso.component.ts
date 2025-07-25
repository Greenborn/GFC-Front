import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ConfigService } from 'src/app/services/config/config.service';
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
    private loadingController:    LoadingController,
    private router:               Router,
    private configService:        ConfigService
  ) {
    super(alertController);
  }

  public concurso:any;
  public bg_image:string;
  @ViewChild('btnInic') content: HTMLElement

  async ngOnInit() {
    const loading = await this.loadingController.create({ message: '' });
    await loading.present();
    this.publicContestService.getAll('sort=-id').subscribe(
      ok => {
          this.concurso = ok[0];
          this.bg_image = this.configService.imageUrl(this.concurso.img_url);
          loading.dismiss();
      },
      err => {
          super.displayAlert('No se obtuvo información de concursos activos.');
          loading.dismiss();
      }
    );
  }

  get aspecto() {
   return document.body.classList.contains("dark")
  }

}
