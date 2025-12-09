import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ResponsiveService } from 'src/app/services/ui/responsive.service';
import { Login } from '../../models/login.model';
import { AuthService } from '../../services/auth.service';

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
    public responsiveService: ResponsiveService
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
      const msg = (err && err.error && err.error.message) ? err.error.message : (err && err.message ? err.message : 'Usuario o contraseña incorrecta.')
      this.error = msg
      this.loading = false
    }).then(r => {
      if (r == true) {
        this.login.username = ''
        this.login.password = ''
      }
      this.loading = false
    })
  }

  recordarPass(){
      alert();
  }
}
