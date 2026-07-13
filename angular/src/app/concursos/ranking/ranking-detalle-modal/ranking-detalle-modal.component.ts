import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { VerFotografiasComponent } from '../../concurso-detail/ver-fotografias/ver-fotografias.component';

@Component({
  selector: 'app-ranking-detalle-modal',
  templateUrl: './ranking-detalle-modal.component.html',
  styleUrls: ['./ranking-detalle-modal.component.scss']
})
export class RankingDetalleModalComponent implements OnInit {
  @Input() detalle: any;
  @Input() categoriaNombre = '';
  @Input() seccionNombre = 'General';

  expandedContests: boolean[] = [];

  constructor(
    public modalController: ModalController,
    public responsiveService: ResponsiveService,
    public configService: ConfigService,
    private UIUtilsService: UiUtilsService
  ) {}

  ngOnInit() {
    this.expandedContests = this.detalle?.items?.map(() => true) ?? [];
  }

  toggleContest(i: number) {
    this.expandedContests[i] = !this.expandedContests[i];
  }

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
      const pa = a?.metric?.prize;
      const pb = b?.metric?.prize;
      const va = (pa && pa != '0') ? pa.toString().toLowerCase().trim() : '';
      const vb = (pb && pb != '0') ? pb.toString().toLowerCase().trim() : '';
      if (va && !vb) return -1;
      if (!va && vb) return 1;
      if (va < vb) return -1;
      if (va > vb) return 1;
      const sa = a?.metric?.score ?? 0;
      const sb = b?.metric?.score ?? 0;
      return sb - sa;
    });
  }

  openPhotoModal(img: any, results?: any[]) {
    const source = results || this.detalle?.results || [];
    const sortedResults = this.sortResults(source);
    const allImages: any[] = [];

    sortedResults.forEach((r: any) => {
      const sortedImages = this.sortImages(r.images || []);
      sortedImages.forEach((i: any) => {
        const fullUrl = i.url || i.image_url || i.full_url || i.original_url || i.thumbnail_url;
        allImages.push({
          image: {
            id: i.id || i.contest_image_id,
            title: i.title,
            url: fullUrl,
            thumbnail: i.thumbnail_url,
            code: i.code || '',
            profile: {
              name: this.detalle?.profile?.name || '',
              last_name: this.detalle?.profile?.last_name || ''
            }
          },
          section: r.section ? { name: typeof r.section === 'string' ? r.section : r.section?.name } : null,
          metric: {
            prize: i.metric?.prize,
            score: i.metric?.score
          }
        });
      });
    });

    const index = allImages.findIndex(
      (item: any) => item.image.thumbnail === (img.thumbnail_url || img.url)
    );

    if (index === -1) return;

    this.UIUtilsService.mostrarModal(
      VerFotografiasComponent,
      { index, all_data: allImages, open: false },
      true
    );
  }
}