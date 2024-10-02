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
  @Input() index: any;
  @Input() all_data: any;
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

  anterior(){
    this.index --;
    if (this.index < 0) this.index = this.all_data.length - 1
  }

  siguiente(){
    this.index ++;
    if (this.index >= this.all_data.length) this.index = 0
  }

}
