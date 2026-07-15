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
  @Input() footer: Footer;
  
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
    this.footer = this.footerService.template
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
    if (this.datosCargados()) {
      this.posting = true
      const model: Footer = {
        id: this.footer.id,
        facebook: this.footer.facebook,
        instagram: this.footer.instagram,
        youtube: this.footer.youtube,
        email: this.footer.email
      }

      console.log('posting', model)

      super.fetch<Footer>(
        () => this.footerService.post(model, model.id)
      ).subscribe(
        async footer => {
          console.log('posted ', footer)
          this.posting = false
          try { await this.modalController.dismiss({ footer }); } catch {}
        },
        async err => {
          const message = err?.error?.text || err?.error?.message || err?.message || 'Error al actualizar footer';
          super.displayAlert(this.errorFilter(message))
          this.posting = false
        }
      )
    }
  }
    
  dismiss() {
    try { this.modalController.dismiss(); } catch {}
  }
  datosCargados() {
    //return this.image.code !=  undefined 
    return this.footer.facebook !=  undefined 
        && this.footer.instagram != undefined
        && this.footer.youtube != undefined
        && this.footer.email != undefined
  }

}
