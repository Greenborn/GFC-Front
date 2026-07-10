import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Profile } from 'src/app/models/profile.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { PublicProfileService } from 'src/app/services/public-profile.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { SlidesComponent } from 'src/app/shared/slides/slides.component';

@Component({
  selector: 'app-presentacion-comision-directiva',
  templateUrl: './presentacion-comision-directiva.component.html',
  styleUrls: ['./presentacion-comision-directiva.component.scss'],
})
export class PresentacionComisionDirectivaComponent extends ApiConsumer implements OnInit {
  
  async ngOnInit() {
    this.publicProfileService.getAll<Profile>(
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
        slidesPerView: 1,
        slidesPerViewTablet: 3,
        slidesPerViewDesktop: 4,
        autoplay: true,
        navigation: true,
      };
          
        })
  }

  @ViewChild('slideWithNav', { static: false }) slideWithNav: SlidesComponent;

  sliderOne: any = {
    isBeginningSlide: true,
    isEndSlide: false,
    slidesItems: []
  };
  slideOptions: any = {};

  constructor(
    public  alertController:      AlertController,
    public configService: ConfigService,
    public publicProfileService: PublicProfileService,
    public responsiveService: ResponsiveService
  ) {
    
    super(alertController);
  }

  swipeNext(){
    if (!this.slideWithNav.isEnd()){
      this.slideWithNav.slideNext()
    } else {
      this.slideWithNav.slideTo(0)
    }
  }

  swipePrev(){
    if (!this.slideWithNav.isBeginning()){
      this.slideWithNav.slidePrev()
    } else {
      this.slideWithNav.slideTo(this.slideWithNav.length() - 1)
    }
  }


}
