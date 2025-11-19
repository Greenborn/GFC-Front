import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-ranking-detalle-modal',
  templateUrl: './ranking-detalle-modal.component.html',
  styleUrls: ['./ranking-detalle-modal.component.scss']
})
export class RankingDetalleModalComponent {
  @Input() detalle: any;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }
}