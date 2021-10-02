import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { AuthService } from '../modules/auth/services/auth.service';
import { UserService } from '../services/user.service';
// import { AuthService } from '../services/auth/auth.service';
// import { Usuario } from './usuario.model';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage implements OnInit {

  user: User;
  public username: string;
  public userId: number;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.user = this.userService.template;
    this.userId = this.authService.userId
  }
  ionViewWillEnter() {
    this.username = this.authService.username;
    this.authService.user.then(u => this.user = u)
  }

  logout() {
    this.authService.logout();
  }

}
