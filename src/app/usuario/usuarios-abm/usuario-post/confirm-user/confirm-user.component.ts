import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { CreateUserService } from 'src/app/services/create-user.service';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';

@Component({
  selector: 'app-confirm-user',
  templateUrl: './confirm-user.component.html',
  styleUrls: ['./confirm-user.component.scss'],
})
export class ConfirmUserComponent  extends ApiConsumer  implements OnInit {

  @Input() signUpVerifToken: string;
  @Input() modalController: ModalController;

  public codigoVerificacion:string = "";

  constructor(
    private createUserService: CreateUserService,
    private UIUtilsService: UiUtilsService,
    public responsiveService: ResponsiveService,
    alertCtrl: AlertController,
    private router: Router,
  ) {
    super(alertCtrl);
  }

  ngOnInit() {
  }

  confirmarUsuario(){
      this.UIUtilsService.presentLoading();
      this.createUserService.put({sign_up_verif_token:this.signUpVerifToken, sign_up_verif_code:this.codigoVerificacion},1).subscribe(
          ok => {
            this.UIUtilsService.dismissLoading();
            console.log(ok);
            if (ok['success']) {
              super.displayAlert("Usuario Habilitado! Ya puede ingresar al sistema.");
              this.modalController.dismiss();
              this.router.navigateByUrl('/login');
            } else {
              super.displayAlert("Código de verificación incorrecto.");
            }
          },
          err => {
            this.UIUtilsService.dismissLoading();       
            super.displayAlert("Ocurrió un error al intentar realizar la petición de activación de usuario.");
          }
      );
  }

}
