import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  username: string;
  password: string;
  error: string;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  async login(f: NgForm){
    // console.log('log in form:', f.value, f.valid);
    if (f.valid) {
      const { username, password } = f.value;
      const r = await AuthService.login(username, password);
      if (r) {
        this.error = undefined;
        this.router.navigateByUrl('/');
      } else {
        this.error = 'Error';
      }
    }
  }
}
