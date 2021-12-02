import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Image } from 'src/app/models/image.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

@Component({
  selector: 'app-ver-fotografias',
  templateUrl: './ver-fotografias.component.html',
  styleUrls: ['./ver-fotografias.component.scss'],
})
export class VerFotografiasComponent implements OnInit {
  
  @Input() modalController: ModalController;
  @Input() image: Image;
  public yepImg: boolean = true;
  constructor(
    public responsiveService: ResponsiveService,
    public configService: ConfigService
  ) { }

  ngOnInit() {}
  
  getImage() {

  }
}
