import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router }                  from '@angular/router';
// import { Subject }                 from 'rxjs';

import { Login } from '../models/login.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user: User;

  constructor(
    private  router: Router,
    private  http: HttpClient,
    private  config: ConfigService,
    private userService: UserService
    // private  gral:        AppUIUtilsService
  ) { }

  get token(): string{ 
    return localStorage.getItem(this.config.tokenKey)
  }
  set token(t: string) { 
    // localStorage.setItem(this.config.tokenKey, t)
    this.setLocalStorage('token', t)
  }
  get username(): string {
    // return localStorage.getItem(this.config.data.appName + 'username')
    return this.getLocalStorage('token')
  }
  set username(n: string) {
    this.setLocalStorage('username', n)
  }
  get userId(): number {
    // return parseInt(localStorage.getItem(this.config.data.appName + 'userId'))
    return parseInt(this.getLocalStorage('userId'))
  }
  set userId(id: number) {
    // localStorage.setItem(this.config.data.appName + 'userId', id.toString())
    this.setLocalStorage('userId', id)
  }
  get user(): Promise<User> {
    return new Promise<User>(resolve => {
      let u: User;
      if (this._user == undefined) {
        const s = this.http.get<User>(`${this.config.apiUrl('user')}/${this.userId}`).subscribe(
          u => {
            console.log('fetching user data', u)
            this._user = u
            resolve(this._user)
          },
          err => {
            console.log('error fetchingu ser data', err, 'Logging out')
            this.logout()
            resolve(this.userService.template)
          },
          () => s.unsubscribe()
        )
      } else {
        resolve(this._user)
      }
      
    })
    // return {...this._user} 
  }
  // isAdmin(): boolean {
  //   return true
  // }
  // set user(u: User) { 
  //   this._user = u 
  // }
  private setLocalStorage(r: string, v: any): void {
    if (v == null) {
      localStorage.removeItem(this.config.data.appName + r)
    } else {
      localStorage.setItem(this.config.data.appName + r, v .toString())
    }

  }
  private getLocalStorage(r: string): string {
    return localStorage.getItem(this.config.data.appName + r)
  }


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
            this.username = r.username
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
    this.token = this.username = this.userId = null
    this._user = undefined 
    this.router.navigateByUrl('/login')
  }

}
