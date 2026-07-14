import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
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
          const items = (p || []).filter(m => m.organization_type === 'INTERNO');
          items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          this.members = items;
        })
  }

  members: Fotoclub[] = [];

  faceUrl(f){
    if (f != null && f != '' && f != undefined){
        return this.sanitizer.bypassSecurityTrustUrl(f);
      } else {
        return null
      }
  }

  instagramUrl(f){
    if (f != null && f != '' && f != undefined){
      return this.sanitizer.bypassSecurityTrustUrl(f);
    } else {
      return null
    }
  }

  
  mailUrl(f){
    if (f != null && f != '' && f != undefined){
      return this.sanitizer.bypassSecurityTrustUrl(f);
    } else {
      return null
    }
  }

  constructor(
    public  alertController:      AlertController,
    public configService: ConfigService,
    public fotoclubService: FotoclubService,
    private sanitizer: DomSanitizer,
  ) {
    
    super(alertController);
  }

}
