import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Fotoclub } from 'src/app/models/fotoclub.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { FotoclubService } from 'src/app/services/fotoclub.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { SlidesComponent } from 'src/app/shared/slides/slides.component';

@Component({
  selector: 'app-presentacion-miembros',
  templateUrl: './presentacion-miembros.component.html',
  styleUrls: ['./presentacion-miembros.component.scss'],
})
export class PresentacionMiembrosComponent extends ApiConsumer implements OnInit {

  async ngOnInit() {
    this.fotoclubService.getAll<Fotoclub>('filter[organization_type]=INTERNO&filter[mostrar_en_ranking]=1').subscribe(
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

  @ViewChild('slideWithNav', { static: false }) slideWithNav: SlidesComponent;

  cantF: number = 1;
  sliderOne: any = {
    isBeginningSlide: true,
    isEndSlide: false,
    slidesItems: []
  };
  slideOptions: any = {
    initialSlide: 0,
    slidesPerView: 1,
    slidesPerViewTablet: 3,
    slidesPerViewDesktop: 4,
    autoplay: true,
  };

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
    private sanitizer: DomSanitizer,
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
