import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-carga-resultados-modal',
  templateUrl: './carga-resultados-modal.component.html',
  styleUrls: ['./carga-resultados-modal.component.scss']
})
export class CargaResultadosModalComponent {
  @Input() estructura: string;

  constructor(public modalController: ModalController) {}
} 