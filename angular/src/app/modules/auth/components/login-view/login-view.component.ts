import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { UiUtilsService } from 'src/app/services/ui/ui-utils.service';
import { Login } from '../../models/login.model';
import { AuthService } from '../../services/auth.service';
import { SSOAuthService } from '../../services/sso-auth.service';

@Component({
  selector: 'app-login-view',
  templateUrl: './login-view.component.html',
  styleUrls: ['./login-view.component.scss'],
})
export class LoginViewComponent implements OnInit {

  @ViewChild('passInput') passInput: ElementRef
  public visibility: boolean = false;
  public loading: boolean;
  public error: string;
  public login: Login = {
    username: '',
    password: ''
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    public responsiveService: ResponsiveService,
    private uiUtils: UiUtilsService,
    private ssoAuth: SSOAuthService
  ) { }

  ngOnInit() {}
 
  keyPress(e, input = ''){
    if (e.key == "Enter"){
      
      input == 'next' ? this.next() :
        setTimeout(() => {
          console.log(this.passInput)
          this.passInput.nativeElement.setFocus();
        }, 100)
    }
  }

  next() {
    // console.log(this.login)
    this.loading = true
    this.error = undefined
    this.auth.login(this.login, (err) => {
      const isCredencialesInvalidas = err && (err.status === 401 || (err.error && (err.error.message?.toString().includes('Unauthorized') || err.error.error?.toString().includes('Unauthorized'))))
      const apiMessage = err?.error?.error ?? err?.error?.message ?? err?.error ?? err?.message ?? (err?.r === false ? err?.error : undefined) ?? (typeof err === 'string' ? err : undefined)
      const mensaje = isCredencialesInvalidas ? 'Usuario o contraseña incorrectos.' : apiMessage ?? 'Ocurrió un problema al iniciar sesión. Intenta nuevamente.'
      this.uiUtils.mostrarError({
        header: 'Inicio de sesión',
        message: mensaje,
        buttons: [{ text: 'Ok', role: 'cancel' }]
      })
      this.error = undefined
      this.loading = false
    }).then(r => {
      if (r == true) {
        this.login.username = ''
        this.login.password = ''
      }
      this.loading = false
    })
  }

  loginWithGoogle(){
    this.ssoAuth.login();
  }

  recordarPass(){
      alert();
  }
}
