import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
  selector: 'app-ranking-detalle-modal',
  templateUrl: './ranking-detalle-modal.component.html',
  styleUrls: ['./ranking-detalle-modal.component.scss']
})
export class RankingDetalleModalComponent {
  @Input() detalle: any;

  constructor(
    public modalController: ModalController,
    public responsiveService: ResponsiveService,
    public configService: ConfigService
  ) {}

  cerrar() {
    this.modalController.dismiss();
  }
}