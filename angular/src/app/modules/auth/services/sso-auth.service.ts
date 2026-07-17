import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/services/config/config.service';
import { AuthService } from './auth.service';
import { SSOLoginResponse, SSOVerifyResponse, SSOProfileResponse, SSOCallbackResult } from '../models/sso.model';

const SSO_TOKEN_KEY = 'sso_bearer_token';
const SSO_USER_KEY = 'sso_user_data';
const SSO_REDIRECT_URL_KEY = 'sso_redirect_url';
const SSO_CLIENT_UNIQUE_ID = 'sso_client_unique_id';

@Injectable({
  providedIn: 'root'
})
export class SSOAuthService {

  constructor(
    private router: Router,
    private config: ConfigService,
    private auth: AuthService
  ) {}

  login(): void {
    const uniqueId = this.getUniqueId();
    const currentUrl = this.router.url;
    if (currentUrl && currentUrl !== '/login' && currentUrl !== '/login-redirect') {
      try { localStorage.setItem(SSO_REDIRECT_URL_KEY, currentUrl); } catch {}
    }

    const params = new URLSearchParams({
      url_redireccion_app: window.location.origin + this.config.ssoRedirect,
      unique_id: uniqueId
    });

    window.location.href = `${this.config.ssoBaseUrl}/auth/google?${params}`;
  }

  async handleCallback(temporalToken: string, uniqueId: string): Promise<SSOCallbackResult> {
    if (this.getUniqueId() !== uniqueId) {
      throw new Error('Unique ID no coincide');
    }

    const response = await fetch(`${this.config.ssoBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: temporalToken })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('SSO handleCallback: Error al obtener bearer token', response.status, errText);
      throw new Error('Error al obtener bearer token');
    }

    const data: { data: SSOLoginResponse } = await response.json();
    const bearerToken = data.data?.bearer_token;
    const ssoEmail = data.data?.user?.email;
    console.log('SSO bearer token obtained:', bearerToken ? '✓' : '✗', 'email:', ssoEmail);

    if (!bearerToken) {
      throw new Error('No se recibió bearer token del servidor SSO');
    }

    try { localStorage.setItem(SSO_TOKEN_KEY, bearerToken); } catch {}
    try { localStorage.setItem(SSO_USER_KEY, JSON.stringify(data.data?.user || {})); } catch {}

    const profileResponse = await fetch(
      `${this.config.nodeApiBaseUrl}user/sso-profile?unique_id=${uniqueId}`,
      {
        headers: { 'Authorization': `Bearer ${bearerToken}` }
      }
    );

    if (!profileResponse.ok) {
      this.clearSession();
      throw new Error('Error al verificar perfil local');
    }

    const profileData: SSOProfileResponse = await profileResponse.json();
    console.log('SSO profile check result:', profileData);

    if (profileData.exists && profileData.user) {
      this.auth.userId = profileData.user.id;
      this.auth.updateUser();
      this.auth.token = bearerToken;
      return {
        exists: true,
        localUser: {
          id: profileData.user.id,
          username: profileData.user.username,
          email: profileData.user.email,
          role_id: profileData.user.role_id
        },
        ssoEmail,
        bearer_token: bearerToken
      };
    }

    return {
      exists: false,
      ssoEmail,
      bearer_token: bearerToken
    };
  }

  async verifySession(): Promise<{ authenticated: boolean; requireReauth?: boolean; user?: any; extended?: boolean }> {
    const token = this.getToken();
    if (!token) {
      return { authenticated: false };
    }

    try {
      const response = await fetch(`${this.config.ssoBaseUrl}/auth/verify?unique_id=${this.getUniqueId()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.require_reauth) {
          this.clearSession();
          this.auth.token = null;
          return { authenticated: false, requireReauth: true };
        }
        throw new Error('Token inválido');
      }

      const result: { data: SSOVerifyResponse['data'] } = await response.json();

      try { localStorage.setItem(SSO_USER_KEY, JSON.stringify(result.data.user)); } catch {}

      return {
        authenticated: true,
        user: result.data.user,
        extended: result.data.extended
      };
    } catch (error) {
      this.clearSession();
      this.auth.token = null;
      return { authenticated: false };
    }
  }

  async   logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${this.config.ssoBaseUrl}/auth/logout?unique_id=${this.getUniqueId()}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error al cerrar sesión SSO:', error);
      }
    }
    this.clearSession();
    this.auth.token = null;
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(SSO_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  getUser(): any | null {
    try {
      const userData = localStorage.getItem(SSO_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  isSSOSession(): boolean {
    try {
      return localStorage.getItem(SSO_TOKEN_KEY) !== null;
    } catch {
      return false;
    }
  }

  getUniqueId(): string {
    try {
      let id = localStorage.getItem(SSO_CLIENT_UNIQUE_ID);
      if (!id) {
        id = this.generateUniqueId();
        localStorage.setItem(SSO_CLIENT_UNIQUE_ID, id);
      }
      return id;
    } catch {
      return this.generateUniqueId();
    }
  }

  getAndClearRedirectUrl(): string | null {
    try {
      const url = localStorage.getItem(SSO_REDIRECT_URL_KEY);
      localStorage.removeItem(SSO_REDIRECT_URL_KEY);
      return url;
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    try {
      localStorage.removeItem(SSO_TOKEN_KEY);
      localStorage.removeItem(SSO_USER_KEY);
      localStorage.removeItem(SSO_REDIRECT_URL_KEY);
      localStorage.removeItem(SSO_CLIENT_UNIQUE_ID);
    } catch {}
  }

  private generateUniqueId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
