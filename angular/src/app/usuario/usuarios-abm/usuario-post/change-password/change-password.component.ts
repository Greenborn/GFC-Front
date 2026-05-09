import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UserService } from 'src/app/services/user.service';
import { ApiAdminChangePasswordBody, ApiChangePasswordBody } from 'src/app/models/ApiRequest';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() userId: number;
  @Input() requireOldPassword: boolean = true;
  
  public posting: boolean = false;
  public old_password: string;
  public new_password: string;
  public confirm_password: string;
  public passChangeFocus=false;

  constructor(
    private userService: UserService,
    alertCtrl: AlertController,
    public responsiveService: ResponsiveService
  ) { 
    super(alertCtrl)
  }

  ngOnInit() {}

  changePassword(f: NgForm) {
    if (!f.valid) {
      return;
    }

    if (this.new_password !== this.confirm_password) {
      super.displayAlert('Las contraseñas no coinciden.');
      return;
    }

    this.posting = true;

    if (this.requireOldPassword) {
      const body: ApiChangePasswordBody = {
        old_password: f.value.old_password,
        new_password: this.new_password
      };
      super.fetch<any>(() => this.userService.changePassword(body, this.userId)).subscribe(
        () => {
          this.posting = false;
          this.modalController.dismiss();
        },
        err => {
          this.posting = false;
          super.displayAlert(this.errorFilter(err.error['message']));
        }
      );
    } else {
      const body: ApiAdminChangePasswordBody = {
        password: this.new_password
      };
      super.fetch<any>(() => this.userService.updatePassword(body, this.userId)).subscribe(
        () => {
          this.posting = false;
          this.modalController.dismiss();
        },
        err => {
          this.posting = false;
          super.displayAlert(this.errorFilter(err.error['message']));
        }
      );
    }
  }
}
