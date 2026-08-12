import { Component } from '@angular/core';
import { SsoCallbackComponent, SSOCallbackResult } from 'angular-greenborn-sso-front';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [SsoCallbackComponent],
  selector: 'app-login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
})
export class LoginRedirectComponent {
  constructor(private auth: AuthService) {}

  onSuccess(result: SSOCallbackResult): void {
    if (result.exists && result.localUser) {
      this.auth.userId = result.localUser.id;
      this.auth.updateUser();
    }
  }
}
