import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Footer } from 'src/app/models/footer.model';
import { FooterService } from 'src/app/services/footer.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';

@Component({
  selector: 'app-footer-post',
  templateUrl: './footer-post.component.html',
  styleUrls: ['./footer-post.component.scss'],
})
export class FooterPostComponent extends ApiConsumer implements OnInit {
  
  @Input() modalController: ModalController;
  @Input() footer: Footer = this.footerService.template;
  public facebook: string;
  public instagram: string;
  public youtube: string;
  public email:string;
  private cont: number = 0;
  public posting: boolean = false; 

  constructor(
    public responsiveService: ResponsiveService,  
    alertCtrl: AlertController,    
    private footerService: FooterService,
    ) { 
    super(alertCtrl)
  }

  ngOnInit() {
    if (this.footer === undefined) {
      // this.footer = this.footerService.template
    } else {
      this.facebook = this.footer.facebook
      this.instagram = this.footer.instagram
      this.youtube = this.footer.youtube
      this.email = this.footer.email
    }
  }

  async postFooter() {
    if (this.cont < 1) {
      this.cont++
    if (this.datosCargados()) {
        // setTimeout(() => this.cont = 0, 500)
        this.posting = true
       // let i: Footer;//footer
        const model: Footer = {
          facebook: this.footer.facebook,
          instagram: this.footer.instagram,
          youtube: this.footer.youtube,
          email: this.footer.email
        }
        console.log('posting', model)
        // super.fetch<any>(() =>
          // this.footerService.postFormData<any>(model)
        // ).subscribe(
          super.fetch<Footer>(
            () => this.footerService.post(model, this.footer.id)
          ).subscribe(
         footer => {
            console.log('posted ', footer)
            this.posting = false
            // i = footer
            this.modalController.dismiss({ footer })
          },
          async err => {
            super.displayAlert(err.error['message'])
            this.posting = false
          },
        )
      }
    }
  }
    
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
     
    });
  }
  datosCargados() {
    //return this.image.code !=  undefined 
    return this.footer.facebook !=  undefined 
        && this.footer.instagram != undefined
        && this.footer.youtube != undefined
        && this.footer.email != undefined
  }

}
