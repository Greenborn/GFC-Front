import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UserService } from 'src/app/services/user.service';
import { ApiAdminChangePasswordBody, ApiChangePasswordBody } from 'src/app/models/ApiRequest';
import { AlertService } from 'src/app/services/ui/alert.service';

@Component({
  standalone: false,
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent extends ApiConsumer implements OnInit {

  @Input() modalController: any;
  @Input() userId: number;
  @Input() requireOldPassword: boolean = true;
  
  public posting: boolean = false;
  public old_password: string;
  public new_password: string;
  public confirm_password: string;
  public passChangeFocus=false;

  constructor(
    private userService: UserService,
    alertService: AlertService,
    public responsiveService: ResponsiveService
  ) { 
    super(alertService)
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

    const body: ApiAdminChangePasswordBody = {
      password: this.new_password,
      ...(this.old_password ? { actual_password: this.old_password } : {})
    };
    super.fetch<any>(() => this.userService.updatePassword(body, this.userId)).subscribe(
      res => {
        this.posting = false;
        this.modalController.dismiss();
        super.displayAlert(res?.message ?? 'Contraseña actualizada correctamente', 'Éxito');
      },
      err => {
        this.posting = false;
        super.displayAlert(this.errorFilter(err.error['message']));
      }
    );
  }
}
