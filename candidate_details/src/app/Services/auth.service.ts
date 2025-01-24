import { Injectable } from '@angular/core';
import { Login } from '../Models/login.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  loginService(login: Login) {
    debugger;
    return this.http.post(`${this.baseUrl}Account/Login`, login);
  }

  storeToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
