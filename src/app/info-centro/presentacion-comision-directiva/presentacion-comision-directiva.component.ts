import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonSlides } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Profile } from 'src/app/models/profile.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

@Component({
  selector: 'app-presentacion-comision-directiva',
  templateUrl: './presentacion-comision-directiva.component.html',
  styleUrls: ['./presentacion-comision-directiva.component.scss'],
})
export class PresentacionComisionDirectivaComponent extends ApiConsumer implements OnInit {
  
  async ngOnInit() {
    this.profileService.getAll<Profile>(
      'filter[executive]=true'
    ).subscribe(
        async  p => {
          this.sliderOne =
      {
        isBeginningSlide: true,
        isEndSlide: false,
        slidesItems: p
      };
      this.slideOptions = {
        initialSlide: 0,
        slidesPerView: p.length < 3 ? p.length : 3,
        autoplay: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      };
          
        })
  }

  @ViewChild('slideWithNav', { static: false }) slideWithNav: IonSlides;

  sliderOne: any = {
    isBeginningSlide: true,
    isEndSlide: false,
    slidesItems: []
  };
  slideOptions: any = {};

  constructor(
    public  alertController:      AlertController,
    public configService: ConfigService,
    public profileService: ProfileService,
    public responsiveService: ResponsiveService
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
