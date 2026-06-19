import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SSOAuthService } from '../../services/sso-auth.service';

@Component({
  selector: 'app-login-redirect',
  templateUrl: './login-redirect.component.html',
  styleUrls: ['./login-redirect.component.scss'],
})
export class LoginRedirectComponent implements OnInit, OnDestroy {

  error: string = '';
  private sub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ssoAuth: SSOAuthService
  ) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const uniqueId = params['unique_id'];

      if (token && uniqueId) {
        this.ssoAuth.handleCallback(token, uniqueId)
          .then(result => {
            if (result.exists) {
              const redirectUrl = this.ssoAuth.getAndClearRedirectUrl();
              this.router.navigateByUrl(redirectUrl || '/');
            } else {
              this.router.navigateByUrl(`/registro?email=${encodeURIComponent(result.ssoEmail)}`);
            }
          })
          .catch(err => {
            console.error('Error en callback SSO:', err);
            this.error = 'Error al autenticar. Intenta nuevamente.';
            setTimeout(() => {
              this.router.navigateByUrl('/login?error=auth_failed');
            }, 3000);
          });
      } else {
        this.error = 'Parámetros de autenticación no recibidos.';
        setTimeout(() => {
          this.router.navigateByUrl('/login?error=missing_params');
        }, 3000);
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}
