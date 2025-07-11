import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router }                  from '@angular/router';
// import { Subject }                 from 'rxjs';

import { Login } from '../models/login.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { User, UserLogged } from 'src/app/models/user.model';
import { Profile, ProfileExpanded } from 'src/app/models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private _user: User;
  private _user: Promise<UserLogged>;

  constructor(
    private  router: Router,
    private  http: HttpClient,
    private  config: ConfigService,
    // private  gral:        AppUIUtilsService
  ) { 
    // this.updateUser()
  }

  get token(): string{ 
    return localStorage.getItem(this.config.tokenKey)
  }
  set token(t: string) { 
    this.config.setLocalStorage('token', t)
  }
  set username(n: string) {
    this.config.setLocalStorage('username', n)
  }
  get userId(): number {
    return parseInt(this.config.getLocalStorage('userId'))
  }
  set userId(id: number) {
    this.config.setLocalStorage('userId', id)
  }

  get user(): Promise<UserLogged|null> {
    // return this._user

    if (this._user == undefined && this.loggedIn) {
      this._user = new Promise<UserLogged>(resolve => {
        // console.log('get user ' + this._user)
        // 
        const s = this.http.get<UserLogged>(
          `${this.config.apiUrl('user')}/${this.userId}?expand=profile,profile.fotoclub,role`
        ).subscribe(
          u => {
            console.log('fetching user data', u)
            resolve(u)
          },
          err => {
            console.log('error fetching profile data', err)
            resolve(null)
          },
          () => s.unsubscribe()
        )
        
        
      })
    } else {
      // console.log('return user')
    }
    
    return this._user
  }
  updateUser(): void {
    this._user = undefined
  }

  // updateUser(u: User = undefined): void {
  //   this._user = u ? new Promise<User>(resolve => resolve(u)) : undefined
  // }

  // isAdmin(): boolean {
  //   return true
  // }
  // set user(u: User) { 
  //   this._user = u 
  // }

  get loggedIn(): boolean {
    // console.log(localStorage)
    return this.token != null
  }

  login(model: Login, onError: CallableFunction): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      console.log('log in', model)
      const headers = new HttpHeaders({ 'Content-Type':  'application/json' })

      // this.gral.presentLoading();
      this.http.post(this.config.loginUrl, model, { headers }).subscribe(
        data => {
          const r = (data as any)
          // this.gral.dismissLoading();
          
          if ( r.hasOwnProperty("token") ){
            console.log('login de usuario', data)
            this.token = r.token
            this.userId = r.id
            resolve(true)
            // localStorage.setItem( this.confGral['appName']+'logedIn', JSON.stringify( true ) );
            this.router.navigateByUrl('/')
          } else {
            console.log('login error', data)

            onError(data)
            resolve(false)
            // this.gral.showMessage( 'Usuario o contraseña incorrecta.' );
          }
        },
        err =>  {
          // this.gral.dismissLoading();
          
          console.log('login http error', err)
          onError(err)
          resolve(false)
          // localStorage.setItem( this.confGral['appName']+'logedIn',      JSON.stringify( false ) );
          // localStorage.setItem( this.confGral['appName']+'token',        JSON.stringify( '' ) );
          
          // this.gral.showMessage( 'Usuario o contraseña incorrecta.' );
        }
      )
    })
  }

  async logout() { // cerrar sesion en api
    this.token  = this.userId = null
    this.userId = undefined;
    this._user  = undefined 
    this.router.navigateByUrl('/login')
  }

}
