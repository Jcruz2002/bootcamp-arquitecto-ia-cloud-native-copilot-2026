import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './app.constants';

export type UserItem = {
  id: string;
  name: string;
  email: string;
  status?: string;
};

export type UserPayload = {
  name: string;
  email: string;
};

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  list(skip = 0, take = 20): Observable<UserItem[]> {
    return this.http.get<UserItem[]>(`${API_BASE_URL}/api/v1/users?skip=${skip}&take=${take}`);
  }

  create(payload: UserPayload): Observable<UserItem> {
    return this.http.post<UserItem>(`${API_BASE_URL}/api/v1/users`, payload);
  }

  update(id: string, payload: UserPayload): Observable<UserItem> {
    return this.http.put<UserItem>(`${API_BASE_URL}/api/v1/users/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/v1/users/${id}`);
  }
}
