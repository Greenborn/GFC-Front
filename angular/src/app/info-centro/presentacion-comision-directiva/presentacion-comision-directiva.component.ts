import { Component, OnInit } from '@angular/core';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AlertService } from 'src/app/services/ui/alert.service';
import { Profile } from 'src/app/models/profile.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { PublicProfileService } from 'src/app/services/public-profile.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-presentacion-comision-directiva',
  templateUrl: './presentacion-comision-directiva.component.html',
  styleUrls: ['./presentacion-comision-directiva.component.scss'],
})
export class PresentacionComisionDirectivaComponent extends ApiConsumer implements OnInit {
  
  ngOnInit() {
    this.publicProfileService.getAll<Profile>(
      'filter[executive]=true'
    ).pipe(
      timeout(8000),
      catchError(err => {
        console.warn('Error al cargar comisión directiva:', err);
        return of([]);
      })
    ).subscribe(
        p => {
          const items = p || [];
          const roleOrder = [
            'presidenta',
            'presidente',
            'vice presidenta',
            'vice presidente',
            'secretaria',
            'secretario',
            'tesorera',
            'tesorero',
            'difusión',
            'difusion',
            'redes',
          ];
          items.sort((a, b) => {
            const aRol = (a.executive_rol || '').toLowerCase().trim();
            const bRol = (b.executive_rol || '').toLowerCase().trim();
            const aIdx = roleOrder.findIndex(r => aRol.startsWith(r));
            const bIdx = roleOrder.findIndex(r => bRol.startsWith(r));
            return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
          });
          this.directives = items;
        })
  }

  directives: Profile[] = [];

  constructor(
    public  alertController:      AlertService,
    public configService: ConfigService,
    public publicProfileService: PublicProfileService,
  ) {
    
    super(alertController);
  }

}
