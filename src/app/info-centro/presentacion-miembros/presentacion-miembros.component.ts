import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController, IonSlides } from '@ionic/angular';
import { ConcursosPageModule } from 'src/app/concursos/concursos.module';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';

@Component({
  selector: 'app-presentacion-miembros',
  templateUrl: './presentacion-miembros.component.html',
  styleUrls: ['./presentacion-miembros.component.scss'],
})
export class PresentacionMiembrosComponent extends ApiConsumer implements OnInit {

  async ngOnInit() {
    this.fotoclubService.getAll<Fotoclub>().subscribe(
        async  p => {
          this.cantF = p.length
          this.sliderOne =
      {
        isBeginningSlide: true,
        isEndSlide: false,
        slidesItems: p
      };        
        })
  }

  @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;

  cantF: number = 1;
  sliderOne: any = {
    isBeginningSlide: true,
    isEndSlide: false,
    slidesItems: []
  };
  slideOptions: any = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  };
  // perfiles: Profile[] = [];

  get aspecto() {
    return document.body.classList.contains("dark")
   }
   
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
    private sanitizer: DomSanitizer
  ) {
    
    super(alertController);
    //Item object for Nature
  }
  async swipeNext(){
    if (await this.slideWithNav.isEnd() != true){
      this.slideWithNav.slideNext()
    } else {
      this.slideWithNav.slideTo(0)
    }
  }

  async swipePrev(){
    if (await this.slideWithNav.isBeginning() != true){
      this.slideWithNav.slidePrev()
    } else {
      this.slideWithNav.slideTo(await this.slideWithNav.length() - 1)
    }
  }


}
