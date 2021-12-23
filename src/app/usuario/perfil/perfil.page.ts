import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiConsumer } from 'src/app/models/ApiConsumer';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ProfileService } from 'src/app/services/profile.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage extends ApiConsumer implements OnInit {

  constructor(
    alertCtrl: AlertController,
    public authService: AuthService,
    private userService: UserService,
    public profileService: ProfileService,
    public configService: ConfigService
  ) { 
    super(alertCtrl)
  }
  
  ngOnInit() {
    console.log("usuario: ", this.authService.user)
    
  }

}
