import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { ConcursoDetailService } from '../concurso-detail.service';

@Component({
  selector: 'app-ver-fotografias',
  templateUrl: './ver-fotografias.component.html',
  styleUrls: ['./ver-fotografias.component.scss'],
})
export class VerFotografiasComponent implements OnInit {
  
  @Input() modalController: ModalController;
  @Input() image: any;
  public yepImg: boolean = true;
  public inscriptos: any[] = [];

  constructor(
    public responsiveService: ResponsiveService,
    public configService: ConfigService,
    public concursoDetailService: ConcursoDetailService,
  ) { }

  ngOnInit() {
    const s2 = this.concursoDetailService.inscriptos.subscribe(cs =>{
      this.inscriptos = cs
      console.log(this.inscriptos)
    })
  }
  
  getImage() {

  }

  getFullName(profile_id: number) {
    const p = this.inscriptos.find(p => p.profile_id == profile_id)
    return p != undefined ? `${p.profile.name} ${p.profile.last_name}` : ''
  }
}
