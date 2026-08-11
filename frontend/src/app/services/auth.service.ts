import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject, of } from 'rxjs';
import { User, Settings } from '../models/user.model';

import { ThemeService } from './theme.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  
  // Signals for state
  currentUser = signal<User | null>(null);
  userSettings = signal<Settings | null>(null);
  
  constructor() {
    // Initialize user from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    // Effect to auto-apply theme changes
    effect(() => {
      const settings = this.userSettings();
      if (settings) {
        this.themeService.setTheme(settings.theme);
      }
    });

    // If logged in, fetch settings
    if (this.currentUser()) {
      this.fetchSettings().subscribe();
    }
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get refreshTokenValue(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.success) {
          this.handleAuthSuccess(res.accessToken, res.user);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success) {
          this.handleAuthSuccess(res.accessToken, res.user);
        }
      })
    );
  }

  logout(): Observable<any> {
    const token = this.token;
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      catchError(err => of(err)),
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      })
    );
  }

  changePassword(passwords: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwords);
  }

  refreshToken(): Observable<any> {
    const rToken = this.refreshTokenValue;
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken: rToken }).pipe(
      tap(res => {
        if (res.success && res.accessToken) {
          localStorage.setItem('token', res.accessToken);
        }
      }),
      catchError(err => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      })
    );
  }

  fetchSettings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/settings`).pipe(
      tap(res => {
        if (res.success) {
          this.userSettings.set(res.settings);
        }
      })
    );
  }

  updateSettings(settingsData: Partial<Settings>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/settings`, settingsData).pipe(
      tap(res => {
        if (res.success) {
          this.userSettings.set(res.settings);
        }
      })
    );
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    const current = this.userSettings();
    if (current) {
      const nextTheme = this.themeService.currentTheme();
      this.updateSettings({ theme: nextTheme }).subscribe();
    }
  }

  applyTheme(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
  }

  private handleAuthSuccess(token: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.fetchSettings().subscribe();
  }

  private clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.userSettings.set(null);
  }
}
