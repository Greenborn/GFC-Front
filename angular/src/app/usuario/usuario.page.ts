import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from '../models/ApiConsumer';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';
import { AuthService } from '../modules/auth/services/auth.service';
import { ConfigService } from '../services/config/config.service';
import { ProfileService } from '../services/profile.service';
import { UserService } from '../services/user.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage extends ApiConsumer implements OnInit {

  public authUser: User = null;
  public userProfile: Profile = null;
  public version = environment.version;

  // user: User;
  // user: Promise<User>;
  // public username: string;
  // public userId: number;
  // profile: Promise<Profile>

  constructor(
    alertCtrl: AlertController,
    public authService: AuthService,
    private userService: UserService,
    public profileService: ProfileService,
    public configService: ConfigService
  ) { 
    super(alertCtrl)
  }

  private _dark: boolean = false
  get darkMode() {
    return document.body.classList.contains('dark')
  }
  set darkMode(l: boolean) {
    document.body.classList.toggle('dark', l);
    document.documentElement.setAttribute('data-bs-theme', l ? 'dark' : 'light');
    localStorage.setItem('darkMode', String(l));
    this._dark = l;
  }

  ngOnInit() {
    this.authService.user.then(u => {
      this.authUser = u;
      if (u != null) {
        this.userProfile = u.profile ?? null;
        if (!this.userProfile?.img_url && u.profile_id != null) {
          super.fetch<Profile>(() => this.profileService.get(u.profile_id)).subscribe(p => {
            this.userProfile = p;
          });
        }
      }
    });
  }

  ionViewWillEnter() {
    if (this.authUser?.profile_id != null) {
      super.fetch<Profile>(() => this.profileService.get(this.authUser.profile_id)).subscribe(p => {
        this.userProfile = p;
      });
    }
  }

}
