import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthResponse, LoginRequest, RegisterRequest, RegisterResponse} from "../models/auth.models";
import {Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'http://localhost:8081/api/v1/auth';

  constructor(private http: HttpClient) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      // Enregistrer le token d'authentification dans le stockage local
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      })
    );
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    // Supprimer le token d'authentification du stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  estConnectee(): boolean {
    const token = this.getToken();
    return !!token; // Retourne true si le token existe, sinon false
  }
}
