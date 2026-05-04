import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Względny URL — w dev obsługiwany przez Angularowe proxy
  // (frontend/proxy.conf.json), w produkcji ten sam origin co aplikacja.
  private apiUrl = '/api';
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromLocalStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          localStorage.removeItem(this.tokenKey);
          this.currentUserSubject.next(null);
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string, newPasswordConfirmation: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Czyści sesję lokalnie (bez wywoływania /auth/logout). */
  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  private getUserFromLocalStorage(): any {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // In real app, you'd decode JWT or fetch from /auth/me
      return { authenticated: true };
    }
    return null;
  }
}
