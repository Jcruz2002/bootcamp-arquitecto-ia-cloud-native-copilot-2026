import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, TOKEN_KEY } from './app.constants';

type LoginResponse = {
  accessToken: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/api/v1/auth/login`, {
      username,
      password,
    });
  }

  getToken(): string {
    return globalThis.localStorage?.getItem(TOKEN_KEY) || '';
  }

  setToken(token: string): void {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
  }

  clearSession(): void {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
