import { Injectable } from '@angular/core';
import { Login } from '../Models/login.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  loginService(login: Login) {
    return this.http.post(`${this.baseUrl}api/Account/Login`, login);
  }

  storeToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}api/Account/ForgotPassword`, {
      email,
    });
  }

  ResetPassword(resetForm: FormData) {
    return this.http.post(
      `${this.baseUrl}api/Account/ResetPassword`,
      resetForm
    );
  }

  // Decode token and get role
  getRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return (
          decodedToken.role ||
          decodedToken[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ] ||
          null
        );
      } catch (error) {
        console.error('Invalid token:', error);
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
