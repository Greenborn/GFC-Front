import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Usuario } from './usuario.model';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage implements OnInit {

  usuario: Usuario;
  
  // public yepImg: boolean = true;

  constructor(
    // private db: UsuarioService
    private router: Router
  ) { }

  // falsear(ev: any){
  //   if(ev) {
  //     this.yepImg = false;
  //   }
  // }
  ngOnInit() {
    this.usuario = AuthService.getUsuario();
    // this.usuario = this.db.getUsuario();
  }
  ionViewWillEnter() {
    this.usuario = AuthService.getUsuario();
    // this.usuario = this.db.getUsuario();
    // console.log('Por entrar a vista con usuario ', this.usuario)
  }

  logout() {
    AuthService.logout();
    this.router.navigateByUrl('/');
  }

}
