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

  formatDate(d: any): string {
    if (!d) return '';
    if (d instanceof Date) {
      const day = ('0' + d.getDate()).slice(-2);
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    const s = String(d);
    const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return `${m[3]}/${m[2]}/${m[1]}`;
    }
    const nd = new Date(s);
    if (!isNaN(nd.getTime())) {
      const day = ('0' + nd.getDate()).slice(-2);
      const month = ('0' + (nd.getMonth() + 1)).slice(-2);
      const year = nd.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return s;
  }
}