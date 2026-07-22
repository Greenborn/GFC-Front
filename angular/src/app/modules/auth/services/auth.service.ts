import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import axios from 'axios';
import { Login } from '../models/login.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { UserLogged } from 'src/app/models/user.model';

const SSO_TOKEN_KEY = 'sso_bearer_token';
const SSO_USER_KEY = 'sso_user_data';
const SSO_CLIENT_UNIQUE_ID = 'sso_client_unique_id';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _user: Promise<UserLogged | null> | null = null;

  constructor(
    private router: Router,
    private config: ConfigService,
  ) { }

  get token(): string {
    try {
      return localStorage.getItem(this.config.tokenKey)
    } catch (e) {
      console.warn('localStorage no disponible (token)');
      return null;
    }
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
    if (!this.userId || isNaN(this.userId)) {
      if (!this._user) {
        this._user = Promise.resolve(null);
      }
      return this._user;
    }

    if (this._user == undefined && this.loggedIn) {
      this._user = new Promise<UserLogged>(resolve => {
        const url = `${this.config.nodeApiBaseUrl}user/${this.userId}?expand=profile,profile.fotoclub,role`;
        const token = this.token;
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        axios.get<UserLogged>(url, { headers }).then(u => {
          console.log('fetching user data', u.data)
          resolve(u.data)
        }).catch(err => {
          console.log('error fetching profile data', err)
          resolve(null)
        })
      })
    }
    
    return this._user
  }
  updateUser(): void {
    this._user = undefined
  }

  get loggedIn(): boolean {
    return this.token != null
  }

  login(model: Login, onError: CallableFunction): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      console.log('log in', model)
      const loginUrl = this.config.nodeApiBaseUrl + 'auth/login';
      axios.post(loginUrl, model, { headers: { 'Content-Type': 'application/json' } }).then(
        response => {
          const r = response.data
          if (r.hasOwnProperty("token")) {
            console.log('login de usuario', r)
            this.token = r.token
            this.userId = r.id
            this.updateUser()
            resolve(true)
            this.router.navigateByUrl('/')
          } else {
            console.log('login error', r)
            onError(r)
            resolve(false)
          }
        },
        err => {
          console.log('login http error', err)
          onError(err)
          resolve(false)
        }
      )
    })
  }

  async logout() {
    const bearerToken = this.token;
    if (bearerToken) {
      try {
        await fetch(`${this.config.nodeApiBaseUrl}auth/cerrar_sesion`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${bearerToken}` }
        });
      } catch (error) {
        console.error('Error al cerrar sesión en el backend:', error);
      }
    }
    const ssoToken = localStorage.getItem(SSO_TOKEN_KEY);
    if (ssoToken) {
      try {
        const uniqueId = localStorage.getItem(SSO_CLIENT_UNIQUE_ID) || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await fetch(`${this.config.ssoBaseUrl}/auth/logout?unique_id=${uniqueId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${ssoToken}` }
        });
      } catch (error) {
        console.error('Error al cerrar sesión SSO:', error);
      }
      localStorage.removeItem(SSO_TOKEN_KEY);
      localStorage.removeItem(SSO_USER_KEY);
      localStorage.removeItem(SSO_CLIENT_UNIQUE_ID);
    }
    this.token = this.userId = null
    this.userId = undefined;
    this._user = undefined 
    this.router.navigateByUrl('/login')
  }

  solicitarRecuperacionPassword(email: string) {
    const url = this.config.getRecuperacionPasswordUrl('recupera_pass');
    return from(axios.post(url, { email }).then(r => r.data));
  }

  confirmarCodigoRecuperacion(email: string, code: string) {
    const url = this.config.getRecuperacionPasswordUrl('recupera_pass_confirm_code');
    return from(axios.post(url, { email, code }).then(r => r.data));
  }

  cambiarPasswordConCodigo(email: string, code: string, pass_0: string, pass_1: string) {
    const url = this.config.getRecuperacionPasswordUrl('recupera_pass_new_pass');
    return from(axios.post(url, { email, code, pass_0, pass_1 }).then(r => r.data));
  }
}
