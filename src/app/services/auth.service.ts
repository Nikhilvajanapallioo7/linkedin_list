import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface AuthActionResult {
  success: boolean;
  message: string;
}

interface ValidationError {
  detail?: string | { msg: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly apiBaseUrl = 'http://192.168.1.104:8000/api/v1/auth';
  private currentUser: User | null = null;
  private readonly CURRENT_USER_KEY = 'app_tracker_current_user';
  private readonly AUTH_TOKEN_KEY = 'app_tracker_auth_token';

  constructor() {
    // Load persisted auth session
    const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.logout();
      }
    }

    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      this.logout();
    }
  }

  signUp(name: string, email: string, password: string): Observable<AuthActionResult> {
    // Validate input before sending
    const validationError = this.validateRegistrationInput(name, email, password);
    if (validationError) {
      return of({ success: false, message: validationError });
    }

    const payload: RegisterPayload = { name, email, password };

    return this.http.post<{ message: string; user_id: number }>(
      `${this.apiBaseUrl}/register`,
      payload
    ).pipe(
      map((response) => ({
        success: true,
        message: response?.message || 'Registration successful'
      })),
      catchError((error) =>
        of({
          success: false,
          message: this.getErrorMessage(error, 'Registration failed')
        })
      )
    );
  }

  login(email: string, password: string): Observable<AuthActionResult> {
    // Validate input before sending
    const validationError = this.validateLoginInput(email, password);
    if (validationError) {
      return of({ success: false, message: validationError });
    }

    const payload: LoginPayload = { email, password };

    return this.http.post<LoginResponse>(
      `${this.apiBaseUrl}/login`,
      payload
    ).pipe(
      map((response) => {
        // Store token
        localStorage.setItem(this.AUTH_TOKEN_KEY, response.access_token);

        // Store user from response (backend provides validated user info)
        this.currentUser = response.user;
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(response.user));

        return { success: true, message: 'Login successful' };
      }),
      catchError((error) =>
        of({
          success: false,
          message: this.getErrorMessage(error, 'Invalid email or password')
        })
      )
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token) && this.currentUser !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  private validateRegistrationInput(name: string, email: string, password: string): string | null {
    // Name validation
    if (!name || name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailError = this.validateEmail(email);
    if (emailError) {
      return emailError;
    }

    // Password validation
    const passwordError = this.validatePasswordStrength(password);
    if (passwordError) {
      return passwordError;
    }

    return null;
  }

  private validateLoginInput(email: string, password: string): string | null {
    // Email validation
    const emailError = this.validateEmail(email);
    if (emailError) {
      return emailError;
    }

    // Password cannot be empty
    if (!password) {
      return 'Password is required';
    }

    return null;
  }

  private validateEmail(email: string): string | null {
    if (!email) {
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }

    return null;
  }

  private validatePasswordStrength(password: string): string | null {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/\d/.test(password)) {
      return 'Password must contain at least one digit';
    }

    return null;
  }

  private decodeJwtPayload(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    const exp = payload?.['exp'];
    if (typeof exp !== 'number') {
      return true;
    }

    return Date.now() >= exp * 1000;
  }

  private getErrorMessage(error: any, fallbackMessage: string): string {
    // Handle Pydantic validation errors
    if (error?.error?.detail) {
      const detail = error.error.detail;
      if (typeof detail === 'string') {
        return detail;
      }
      if (Array.isArray(detail)) {
        // Pydantic ValidationError array format
        return detail.map((err: any) => err?.msg || 'Validation error').join('; ');
      }
    }

    if (typeof error?.error?.message === 'string') {
      return error.error.message;
    }

    if (error?.status === 401) {
      return 'Invalid email or password';
    }

    if (error?.status === 400) {
      return error?.error?.detail || 'Invalid request. Please check your input';
    }

    if (error?.status === 0) {
      return 'Cannot connect to backend server. Please ensure it is running on port 8000';
    }

    return fallbackMessage;
  }
}
