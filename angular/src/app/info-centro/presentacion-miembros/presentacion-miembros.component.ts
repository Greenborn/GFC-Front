import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface MemberItem extends Fotoclub {
  instagramSafe?: SafeUrl | null;
  facebookSafe?: SafeUrl | null;
  mailSafe?: SafeUrl | null;
}

@Component({
  standalone: true,
  selector: 'app-presentacion-miembros',
  templateUrl: './presentacion-miembros.component.html',
  styleUrls: ['./presentacion-miembros.component.scss'],
})
export class PresentacionMiembrosComponent extends ApiConsumer implements OnInit {

  ngOnInit() {
    this.fotoclubService.getAll<Fotoclub>('filter[organization_type]=INTERNO&filter[mostrar_en_ranking]=1').pipe(
      timeout(8000),
      catchError(err => {
        console.warn('Error al cargar miembros:', err);
        return of([]);
      })
    ).subscribe(
        p => {
          const items: MemberItem[] = (p || []).filter(m => m.organization_type === 'INTERNO');
          items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          items.forEach(m => {
            m.instagramSafe = this.sanitizeUrl(m.instagram);
            m.facebookSafe = this.sanitizeUrl(m.facebook);
            m.mailSafe = m.email ? this.sanitizer.bypassSecurityTrustUrl('mailto:' + m.email) : null;
          });
          this.members = items;
        })
  }

  members: MemberItem[] = [];

  trackByFn(_index: number, item: MemberItem): number {
    return item.id ?? _index;
  }

  private sanitizeUrl(url: string | undefined | null): SafeUrl | null {
    if (url != null && url !== '') {
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }
    return null;
  }

  constructor(
    public  alertController:      AlertService,
    public configService: ConfigService,
    public fotoclubService: FotoclubService,
    private sanitizer: DomSanitizer,
  ) {
    super(alertController);
  }

}
