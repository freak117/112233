import { api } from './api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return api.post('/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post('/auth/register', data);
  },

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    return api.post('/auth/logout', { refreshToken });
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return api.post('/auth/refresh', { refreshToken });
  },

  async getMe(token: string) {
    return api.get('/users/me', token);
  },

  async updateMe(token: string, data: { displayName?: string; bio?: string }) {
    return api.patch('/users/me', data, token);
  },
};
