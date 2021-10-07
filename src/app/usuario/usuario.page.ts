import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from '../models/ApiConsumer';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';
import { AuthService } from '../modules/auth/services/auth.service';
import { ProfileService } from '../services/profile.service';
import { UserService } from '../services/user.service';
// import { AuthService } from '../services/auth/auth.service';
// import { Usuario } from './usuario.model';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage extends ApiConsumer implements OnInit {

  // user: User;
  // user: Promise<User>;
  // public username: string;
  // public userId: number;
  // profile: Promise<Profile>

  constructor(
    alertCtrl: AlertController,
    public authService: AuthService,
    private userService: UserService,
    public profileService: ProfileService
  ) { 
    super('usuario page', alertCtrl)
  }

  ngOnInit() {
    // this.user = this.userService.template;
    // this.userId = this.authService.userId
  }

  ionViewWillEnter() {
    // this.profile = new Promise<Profile>(resolve => {
    //   this.authService.user.then(u => 
    //     super.fetch<Profile>(
    //       () => this.profileService.get(u.profile_id)
    //     ).subscribe(p => resolve(p))
    //   )
    // })
    // this.authService.user.then(u => this.profile = this.profileService)
    // this.user = this.authService.user
    // this.username = this.authService.username;
    // this.authService.user.then(u => this.user = u)
  }

  logout() {
    // this.authService.logout();
  }

}
