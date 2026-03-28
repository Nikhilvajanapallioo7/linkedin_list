import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h2>Job Application Tracker</h2>
        <h3>Create Account</h3>
        
        <form (ngSubmit)="onSignup()" #signupForm="ngForm">
          <!-- Name Field -->
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              [(ngModel)]="name"
              (input)="validateName()"
              placeholder="Enter your full name (min 2 characters)"
              class="form-input"
              [class.input-error]="!!nameError"
            >
            <div *ngIf="nameError" class="validation-error">
              ⚠️ {{ nameError }}
            </div>
          </div>
          
          <!-- Email Field -->
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              [(ngModel)]="email"
              (input)="validateEmail()"
              placeholder="Enter your email (e.g., user@domain.com)"
              class="form-input"
              [class.input-error]="!!emailError"
            >
            <div *ngIf="emailError" class="validation-error">
              ⚠️ {{ emailError }}
            </div>
          </div>
          
          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              [(ngModel)]="password"
              (input)="validatePassword()"
              placeholder="Create a strong password"
              class="form-input"
              [class.input-error]="!!passwordError"
            >
            
            <!-- Password Strength Indicator -->
            <div class="password-strength-container" *ngIf="password">
              <div class="password-strength-bar">
                <div 
                  class="strength-fill"
                  [class.strength-weak]="passwordStrength === 'weak'"
                  [class.strength-fair]="passwordStrength === 'fair'"
                  [class.strength-good]="passwordStrength === 'good'"
                  [class.strength-strong]="passwordStrength === 'strong'"
                  [style.width.%]="getPasswordStrengthPercent()"
                ></div>
              </div>
              <span class="strength-label" [class]="'strength-' + passwordStrength">
                {{ getPasswordStrengthLabel() }}
              </span>
            </div>
            
            <!-- Password Requirements Checklist -->
            <div class="password-requirements" *ngIf="password">
              <div class="requirement" [class.met]="password.length >= 8">
                <span class="requirement-icon">{{ password.length >= 8 ? '✓' : '○' }}</span>
                <span class="requirement-text">At least 8 characters ({{ password.length }}/8)</span>
              </div>
              <div class="requirement" [class.met]="hasUppercase(password)">
                <span class="requirement-icon">{{ hasUppercase(password) ? '✓' : '○' }}</span>
                <span class="requirement-text">One uppercase letter (A-Z)</span>
              </div>
              <div class="requirement" [class.met]="hasDigit(password)">
                <span class="requirement-icon">{{ hasDigit(password) ? '✓' : '○' }}</span>
                <span class="requirement-text">One digit (0-9)</span>
              </div>
            </div>
            
            <div *ngIf="passwordError" class="validation-error">
              ⚠️ {{ passwordError }}
            </div>
          </div>
          
          <!-- Confirm Password Field -->
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              (input)="validatePasswordMatch()"
              placeholder="Re-enter your password"
              class="form-input"
              [class.input-error]="!!passwordMatchError"
            >
            <div *ngIf="passwordMatchError" class="validation-error">
              ⚠️ {{ passwordMatchError }}
            </div>
          </div>
          
          <!-- Error/Success Messages -->
          <div *ngIf="errorMessage" class="error-message">
            ❌ {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-message">
            ✓ {{ successMessage }}
          </div>
          
          <!-- Submit Button -->
          <button 
            type="submit" 
            [disabled]="!isFormValid() || isSubmitting" 
            class="signup-btn"
          >
            {{ isSubmitting ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>
        
        <div class="login-link">
          <p>Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: Arial, sans-serif;
      padding: 20px;
    }

    .signup-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #333;
      margin: 0 0 10px 0;
      font-size: 1.8em;
    }

    h3 {
      text-align: center;
      color: #666;
      margin: 0 0 30px 0;
      font-size: 1.2em;
      font-weight: normal;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input.form-input {
      width: 100%;
    }

    input.input-error {
      border-color: #dc3545;
    }

    input.input-error:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .validation-error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
      font-weight: 500;
    }

    /* Password Strength Indicator */
    .password-strength-container {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .password-strength-bar {
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      border-radius: 3px;
    }

    .strength-weak {
      background: linear-gradient(90deg, #dc3545, #dc3545);
      width: 25%;
    }

    .strength-fair {
      background: linear-gradient(90deg, #ffc107, #fd7e14);
      width: 50%;
    }

    .strength-good {
      background: linear-gradient(90deg, #17a2b8, #20c997);
      width: 75%;
    }

    .strength-strong {
      background: linear-gradient(90deg, #28a745, #20c997);
      width: 100%;
    }

    .strength-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .strength-label.strength-weak {
      color: #dc3545;
    }

    .strength-label.strength-fair {
      color: #ffc107;
    }

    .strength-label.strength-good {
      color: #17a2b8;
    }

    .strength-label.strength-strong {
      color: #28a745;
    }

    /* Password Requirements */
    .password-requirements {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 5px;
      padding: 12px;
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
      margin-bottom: 6px;
    }

    .requirement:last-child {
      margin-bottom: 0;
    }

    .requirement-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border: 2px solid #ddd;
      border-radius: 50%;
      font-size: 10px;
      font-weight: bold;
      color: #ddd;
    }

    .requirement.met .requirement-icon {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .requirement-text {
      color: #666;
    }

    .requirement.met .requirement-text {
      color: #28a745;
      font-weight: 500;
    }

    .signup-btn {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .signup-btn:hover:not(:disabled) {
      background: #5568d3;
    }

    .signup-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .login-link {
      text-align: center;
      margin-top: 20px;
    }

    .login-link p {
      color: #666;
      margin: 0;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  
  // Validation error messages
  nameError = '';
  emailError = '';
  passwordError = '';
  passwordMatchError = '';
  
  // Form state
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  passwordStrength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Email validation: checks for valid email format
  private isValidEmail(email: string): boolean {
    if (!email || email.indexOf('@') === -1) {
      return false;
    }
    const [localPart, domainPart] = email.split('@');
    return !!localPart && !!domainPart && domainPart.indexOf('.') !== -1;
  }

  // Password validation: checks for uppercase letter
  hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  // Password validation: checks for digit
  hasDigit(password: string): boolean {
    return /[0-9]/.test(password);
  }

  // Validate name field
  validateName(): void {
    if (!this.name.trim()) {
      this.nameError = 'Name is required';
    } else if (this.name.trim().length < 2) {
      this.nameError = 'Name must be at least 2 characters long';
    } else {
      this.nameError = '';
    }
  }

  // Validate email field
  validateEmail(): void {
    if (!this.email.trim()) {
      this.emailError = 'Email is required';
    } else if (!this.isValidEmail(this.email)) {
      this.emailError = 'Invalid email format (e.g., user@domain.com)';
    } else {
      this.emailError = '';
    }
  }

  // Validate password field
  validatePassword(): void {
    this.passwordError = '';

    if (!this.password) {
      this.passwordError = '';
      return;
    }

    if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters long';
    } else if (!this.hasUppercase(this.password)) {
      this.passwordError = 'Password must contain at least one uppercase letter (A-Z)';
    } else if (!this.hasDigit(this.password)) {
      this.passwordError = 'Password must contain at least one digit (0-9)';
    } else {
      this.passwordError = '';
    }

    // Update password strength indicator
    this.updatePasswordStrength();
    
    // Revalidate password match if confirm password is already filled
    if (this.confirmPassword) {
      this.validatePasswordMatch();
    }
  }

  // Validate password confirmation
  validatePasswordMatch(): void {
    if (!this.confirmPassword) {
      this.passwordMatchError = '';
    } else if (this.password !== this.confirmPassword) {
      this.passwordMatchError = 'Passwords do not match';
    } else {
      this.passwordMatchError = '';
    }
  }

  // Update password strength based on criteria met
  private updatePasswordStrength(): void {
    let strengthScore = 0;

    if (this.password.length >= 8) strengthScore++;
    if (this.hasUppercase(this.password)) strengthScore++;
    if (this.hasDigit(this.password)) strengthScore++;

    if (strengthScore === 0 || this.password.length < 8) {
      this.passwordStrength = 'weak';
    } else if (strengthScore === 1) {
      this.passwordStrength = 'fair';
    } else if (strengthScore === 2) {
      this.passwordStrength = 'good';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  // Get password strength label
  getPasswordStrengthLabel(): string {
    switch (this.passwordStrength) {
      case 'weak':
        return 'Weak';
      case 'fair':
        return 'Fair';
      case 'good':
        return 'Good';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  }

  // Get password strength percentage for visual bar
  getPasswordStrengthPercent(): number {
    switch (this.passwordStrength) {
      case 'weak':
        return 25;
      case 'fair':
        return 50;
      case 'good':
        return 75;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  }

  // Check if the entire form is valid
  isFormValid(): boolean {
    return (
      this.name.trim().length >= 2 &&
      this.isValidEmail(this.email) &&
      this.password.length >= 8 &&
      this.hasUppercase(this.password) &&
      this.hasDigit(this.password) &&
      this.password === this.confirmPassword &&
      !this.nameError &&
      !this.emailError &&
      !this.passwordError &&
      !this.passwordMatchError
    );
  }

  // Submit signup form
  onSignup(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Final validation
    this.validateName();
    this.validateEmail();
    this.validatePassword();
    this.validatePasswordMatch();

    // Check all validations passed
    if (!this.isFormValid()) {
      return;
    }

    this.isSubmitting = true;

    this.authService.signUp(this.name, this.email, this.password).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        if (result.success) {
          this.successMessage = result.message + '. Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        } else {
          this.errorMessage = result.message;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        // Handle specific backend errors
        if (err?.error?.detail) {
          this.errorMessage = err.error.detail;
        } else if (err?.error?.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      }
    });
  }
}
