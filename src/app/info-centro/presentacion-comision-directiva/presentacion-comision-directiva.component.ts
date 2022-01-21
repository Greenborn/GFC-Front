import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';

@Component({
  selector: 'app-presentacion-comision-directiva',
  templateUrl: './presentacion-comision-directiva.component.html',
  styleUrls: ['./presentacion-comision-directiva.component.scss'],
})
export class PresentacionComisionDirectivaComponent extends ApiConsumer implements OnInit {

  constructor(
    public  alertController:      AlertController,
  ){
    super(alertController);
  }

  ngOnInit() {
    
  }

}
