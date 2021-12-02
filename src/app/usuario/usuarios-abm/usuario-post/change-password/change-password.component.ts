import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent extends ApiConsumer implements OnInit {

  @Input() modalController: ModalController;
  @Input() userId: number;
  
  public posting: boolean = false;
  public old_password: string;
  public new_password: string;
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
    if (f.valid) {
      this.posting = true
      console.log('changing password user ', this.userId, 'from', f.value.old_password, 'to', f.value.new_password)
      super.fetch<any>(() => this.userService.changePassword(f.value, this.userId)).subscribe(
        u => {
          this.posting = false
          this.modalController.dismiss()
        },
        err => {
          this.posting = false
          console.log('error change password', err)
          super.displayAlert(err.error['message'])  
        }
      )
    }
  }
}
