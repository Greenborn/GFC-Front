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

  totalScoreAll(): number {
    const d = this.detalle;
    if (!d) return 0;
    if (d.items && Array.isArray(d.items)) {
      return d.items.reduce((acc: number, it: any) => acc + (it?.ranking?.total_score ?? 0), 0);
    }
    return d?.ranking?.total_score ?? 0;
  }

  sortResults(results: any[]): any[] {
    if (!Array.isArray(results)) return [];
    return [...results].sort((a: any, b: any) => {
      const ac = (a?.category ?? '').toString().toLowerCase();
      const bc = (b?.category ?? '').toString().toLowerCase();
      if (ac < bc) return -1;
      if (ac > bc) return 1;
      const as = (a?.section ?? '').toString().toLowerCase();
      const bs = (b?.section ?? '').toString().toLowerCase();
      if (as < bs) return -1;
      if (as > bs) return 1;
      return 0;
    });
  }

  sortImages(images: any[]): any[] {
    if (!Array.isArray(images)) return [];
    return [...images].sort((a: any, b: any) => {
      const sa = a?.metric?.score ?? 0;
      const sb = b?.metric?.score ?? 0;
      if (sb !== sa) return sb - sa;
      const pa = (a?.metric?.prize ?? '').toString().toLowerCase();
      const pb = (b?.metric?.prize ?? '').toString().toLowerCase();
      if (pa < pb) return -1;
      if (pa > pb) return 1;
      return 0;
    });
  }
}