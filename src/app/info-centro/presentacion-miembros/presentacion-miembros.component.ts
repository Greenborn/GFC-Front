import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';

@Component({
  selector: 'app-presentacion-miembros',
  templateUrl: './presentacion-miembros.component.html',
  styleUrls: ['./presentacion-miembros.component.scss'],
})
export class PresentacionMiembrosComponent extends ApiConsumer implements OnInit {

  constructor(
    public  alertController:      AlertController,
  ) {
    super(alertController);
  }

  ngOnInit() {}

}
