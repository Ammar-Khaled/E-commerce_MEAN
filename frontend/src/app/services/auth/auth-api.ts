import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthApi {
  private apiUrl: string = environment.apiUrl;
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  registerUser(user: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  registerSeller(seller: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, seller);
  }

}
