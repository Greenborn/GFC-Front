import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from '../models/ApiConsumer';
import { InfoCentro } from '../models/info_centro.model';
import { InfoCentroService } from '../services/info-centro.service';

@Component({
  selector: 'app-info-centro',
  templateUrl: './info-centro.page.html',
  styleUrls: ['./info-centro.page.scss'],
})
export class InfoCentroPage extends ApiConsumer implements OnInit {

  public parrafos: InfoCentro[] = [];

  constructor(
    private infoCentroService: InfoCentroService,
    alertController: AlertController,
  ) {
    super(alertController)
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    super.fetch<InfoCentro[]>(
      () => this.infoCentroService.getAll()
    )
    .subscribe(info => {
      this.parrafos = info
    })
  }

}
