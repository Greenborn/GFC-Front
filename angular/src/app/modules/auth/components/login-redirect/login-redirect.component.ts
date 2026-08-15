import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SsoCallbackComponent, SSOCallbackResult, SSOAuthService } from 'angular-greenborn-sso-front';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
  standalone: true,
  imports: [SsoCallbackComponent],
  selector: 'app-login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
})
export class LoginRedirectComponent {
  constructor(
    private router: Router,
    private auth: AuthService,
    private config: ConfigService,
    private ssoAuth: SSOAuthService,
  ) {}

  async onSuccess(result: SSOCallbackResult): Promise<void> {
    if (!result.exists) {
      this.router.navigate(['/registro'], { queryParams: { email: result.ssoEmail } });
      return;
    }

    const completed = await this.haCompletadoPerfil(result);
    if (!completed) {
      this.router.navigate(['/registro'], { queryParams: { email: result.ssoEmail } });
      return;
    }

    if (result.localUser) {
      this.auth.userId = result.localUser.id;
      this.auth.updateUser();
    }
    this.router.navigateByUrl('/');
  }

  onNoParams(): void {
    this.router.navigateByUrl('/login');
  }

  onError(): void {
    this.router.navigateByUrl('/login?error=auth_failed');
  }

  private async haCompletadoPerfil(result: SSOCallbackResult): Promise<boolean> {
    try {
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (result.bearer_token) {
        headers['Authorization'] = `Bearer ${result.bearer_token}`;
      }
      const res = await fetch(`${this.config.nodeApiBaseUrl}auth/profile-completion?unique_id=${encodeURIComponent(this.ssoAuth.getUniqueId())}`, { headers });
      if (!res.ok) return false;
      const data = await res.json();
      return !!(data?.exists && data?.completed);
    } catch (err) {
      console.error('[LoginRedirect] Error al verificar completitud de perfil', err);
      return false;
    }
  }
}
