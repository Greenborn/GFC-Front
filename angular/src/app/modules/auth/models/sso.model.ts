export interface SSOCallbackParams {
  token: string;
  unique_id: string;
}

export interface SSOLoginResponse {
  bearer_token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    role_id: number;
    [key: string]: any;
  };
}

export interface SSOVerifyResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      nombre: string;
      email: string;
      role_id: number;
      [key: string]: any;
    };
    extended: boolean;
  };
}

export interface SSOProfileResponse {
  success: boolean;
  exists: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    role_id: number;
    profile_id: number;
    status: number;
    [key: string]: any;
  } | null;
}

export interface SSOCallbackResult {
  exists: boolean;
  localUser?: {
    id: number;
    username: string;
    email: string;
    role_id: number;
  };
  ssoEmail: string;
  bearer_token: string;
}
