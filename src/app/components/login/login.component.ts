import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-shell">
      <div class="login-layout">
        <section class="brand-panel" aria-label="Job Tracker overview">
          <div class="brand-badge">APPLICATION TRACKER</div>
          <h1>Track every application. Land the right offer.</h1>
          <p>
            Keep your search organized with one workspace for portals, statuses,
            and interview progress.
          </p>

          <div class="insight-grid">
            <article class="insight-card">
              <span class="insight-label">Applied</span>
              <strong>42</strong>
            </article>
            <article class="insight-card">
              <span class="insight-label">Pending</span>
              <strong>16</strong>
            </article>
            <article class="insight-card">
              <span class="insight-label">Interviewing</span>
              <strong>7</strong>
            </article>
          </div>

          <div class="pipeline-illustration" aria-hidden="true">
            <div class="node node-start">Sourced</div>
            <div class="connector"></div>
            <div class="node node-mid">Applied</div>
            <div class="connector"></div>
            <div class="node node-end">Interview</div>
          </div>
        </section>

        <section class="auth-panel">
          <div class="login-card">
            <h2>Welcome Back</h2>
            <p class="subtitle">Sign in to continue your job search journey</p>

            <form (ngSubmit)="onLogin()" #loginForm="ngForm">
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  email
                  placeholder="name@email.com"
                >
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  [(ngModel)]="password"
                  required
                  placeholder="Enter your password"
                >
              </div>

              <div *ngIf="errorMessage" class="error-message">
                {{ errorMessage }}
              </div>

              <button type="submit" [disabled]="!loginForm.form.valid || isSubmitting" class="login-btn">
                {{ isSubmitting ? 'Logging in...' : 'Login' }}
              </button>
            </form>

            <div class="signup-link">
              <p>Don't have an account? <a routerLink="/signup">Create one now</a></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .login-shell {
      min-height: 100vh;
      padding: 24px;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.18), transparent 34%),
        radial-gradient(circle at 88% 82%, rgba(255, 255, 255, 0.1), transparent 32%),
        linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Poppins', 'Segoe UI', Tahoma, sans-serif;
    }

    .login-layout {
      width: min(1060px, 100%);
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 24px 50px rgba(34, 24, 72, 0.28);
      background: #f4f6ff;
      border: 1px solid rgba(255, 255, 255, 0.28);
    }

    .brand-panel {
      padding: 42px;
      color: #f6f8ff;
      background:
        linear-gradient(170deg, rgba(17, 38, 97, 0.75), rgba(31, 66, 154, 0.55)),
        linear-gradient(135deg, #3d5cc9 0%, #6f42c1 100%);
      position: relative;
    }

    .brand-panel::after {
      content: '';
      position: absolute;
      right: -60px;
      top: -60px;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
    }

    .brand-badge {
      display: inline-block;
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 0.09em;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      margin-bottom: 18px;
    }

    .brand-panel h1 {
      margin: 0;
      font-size: clamp(1.8rem, 2.3vw, 2.5rem);
      line-height: 1.2;
      max-width: 420px;
    }

    .brand-panel p {
      margin: 16px 0 28px;
      line-height: 1.7;
      color: rgba(246, 248, 255, 0.9);
      max-width: 460px;
    }

    .insight-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 30px;
    }

    .insight-card {
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 12px;
      padding: 14px;
      display: grid;
      gap: 4px;
      backdrop-filter: blur(3px);
    }

    .insight-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: rgba(246, 248, 255, 0.8);
    }

    .insight-card strong {
      font-size: 1.5rem;
      line-height: 1;
    }

    .pipeline-illustration {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .node {
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.26);
    }

    .node-start {
      background: rgba(13, 202, 240, 0.24);
    }

    .node-mid {
      background: rgba(255, 193, 7, 0.24);
    }

    .node-end {
      background: rgba(40, 167, 69, 0.28);
    }

    .connector {
      height: 2px;
      width: 34px;
      background: rgba(255, 255, 255, 0.45);
    }

    .auth-panel {
      display: flex;
      align-items: center;
      padding: 28px;
    }

    .login-card {
      background: #ffffff;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 14px 28px rgba(33, 33, 52, 0.12);
      width: 100%;
      max-width: 420px;
    }

    h2 {
      margin: 0;
      color: #1f2442;
      font-size: 1.9rem;
      font-weight: 700;
    }

    .subtitle {
      margin: 8px 0 26px;
      color: #5f6688;
      font-size: 0.98rem;
    }

    .form-group {
      margin-bottom: 18px;
    }

    label {
      display: block;
      margin-bottom: 7px;
      color: #2e3559;
      font-weight: 600;
      font-size: 0.92rem;
    }

    input {
      width: 100%;
      padding: 12px 13px;
      border: 2px solid #e2e7f4;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #1c2140;
      background: #fbfcff;
      box-sizing: border-box;
      transition: all 0.25s ease;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.14);
      background: #ffffff;
    }

    .login-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #516fd8 0%, #7150c8 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      margin-top: 10px;
      box-shadow: 0 10px 18px rgba(99, 96, 191, 0.35);
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 20px rgba(99, 96, 191, 0.42);
    }

    .login-btn:disabled {
      background: #b7bdd3;
      cursor: not-allowed;
      box-shadow: none;
    }

    .error-message {
      background: #ffe6ea;
      color: #8f2438;
      border: 1px solid #ffc7d1;
      padding: 10px 12px;
      border-radius: 9px;
      margin-bottom: 15px;
      font-size: 0.9rem;
    }

    .signup-link {
      text-align: center;
      margin-top: 18px;
    }

    .signup-link p {
      color: #636b8e;
      margin: 0;
    }

    .signup-link a {
      color: #4f6cd6;
      text-decoration: none;
      font-weight: 600;
    }

    .signup-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 900px) {
      .login-layout {
        grid-template-columns: 1fr;
      }

      .brand-panel {
        padding: 30px;
      }

      .auth-panel {
        padding: 20px;
      }
    }

    @media (max-width: 520px) {
      .login-shell {
        padding: 14px;
      }

      .brand-panel {
        padding: 24px;
      }

      .insight-grid {
        grid-template-columns: 1fr;
      }

      .connector {
        width: 18px;
      }

      .login-card {
        padding: 24px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.login(this.email, this.password).subscribe((result) => {
      this.isSubmitting = false;
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.message;
      }
    });
  }
}
