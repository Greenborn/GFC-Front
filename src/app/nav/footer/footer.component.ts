import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { Footer } from 'src/app/models/footer.model';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { RolificadorService } from 'src/app/modules/auth/services/rolificador.service';
import { FooterService } from 'src/app/services/footer.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { FooterPostComponent } from './footer-post/footer-post.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent extends ApiConsumer implements OnInit {
 usrr:boolean =false;
 footer: Footer =  this.footerService.template;

  constructor( 
    public rolificador: RolificadorService,  
    public auth: AuthService,
    private UIUtilsService: UiUtilsService,
    alertCtrl: AlertController,
    private footerService: FooterService,
    private sanitizer: DomSanitizer
    ) { 
      super(alertCtrl)
    }
  async ngOnInit() {
      super.fetch<Footer>(() => this.footerService.get(1)).subscribe(f => {
      this.footer = f
      // console.log('foot', f);
    })
  }

  get faceUrl(){
    return this.sanitizer.bypassSecurityTrustUrl(this.footer.facebook);
  }

  get instagramUrl(){
    return this.sanitizer.bypassSecurityTrustUrl(this.footer.instagram);
  }

  get youUrl(){
    return this.sanitizer.bypassSecurityTrustUrl(this.footer.youtube);
  }

  get mailUrl(){
    return this.sanitizer.bypassSecurityTrustUrl(this.footer.email);
  }

 async editar(e){
   e.preventDefault();
    const { footer } = await this.UIUtilsService.mostrarModal(FooterPostComponent, {footer: {...this.footer}})
    if (footer == undefined) return;
    this.footer = footer;
  }
}
