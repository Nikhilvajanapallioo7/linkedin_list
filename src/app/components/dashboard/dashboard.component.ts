import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { JobApplicationService } from '../../services/job-application.service';
import { JobApplication, JobApplicationCreate, JobURLRequest } from '../../models/job-application.model';

interface PortalStatusCount {
  portal: string;
  pending: number;
  applied: number;
  total: number;
}
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app">
      <header>
        <div class="header-left">
          <h1>🎯 Job Application Tracker</h1>
          <span class="welcome-text" *ngIf="currentUser">Welcome back, {{ currentUser.name }}!</span>
        </div>
        <div class="header-right">
          <button (click)="showUrlForm = !showUrlForm" class="url-btn">
            <span class="btn-icon"></span> {{ showUrlForm ? 'Cancel' : 'Add from URL' }}
          </button>
          <button (click)="showForm = !showForm" class="add-btn">
            <span class="btn-icon"></span> {{ showForm ? 'Cancel' : 'Add Manual' }}
          </button>
          <button (click)="onLogout()" class="logout-btn">
            <span class="btn-icon"></span> Logout
          </button>
        </div>
      </header>

      <!-- Connection Error Alert -->
      <div *ngIf="connectionError" class="connection-error">
        <strong>⚠️ Connection Error:</strong> {{ connectionError }}
        <button (click)="retryConnection()" class="retry-btn">🔄 Retry</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-message">
        <div class="spinner"></div>
        <p>Loading your applications...</p>
      </div>

      <!-- Simplified Filters Section -->
      <div class="filter-section" *ngIf="!isLoading">
        <div class="filter-container">
          <div class="filter-group">
            <label for="statusFilter">
              <span class="filter-icon">📊</span>
              <span class="filter-label">Status</span>
            </label>
            <select
              id="statusFilter"
              [ngModel]="selectedStatus"
              (ngModelChange)="onStatusChange($event)"
              class="filter-select">
              <option *ngFor="let status of statusOptions" [value]="status">
                {{ status === 'All' ? 'All Statuses' : status }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label for="portalFilter">
              <span class="filter-icon">🌐</span>
              <span class="filter-label">Portal</span>
            </label>
            <select
              id="portalFilter"
              [ngModel]="selectedPortal"
              (ngModelChange)="onPortalChange($event)"
              class="filter-select">
              <option *ngFor="let portal of portalOptions" [value]="portal">
                {{ portal }}
              </option>
            </select>
          </div>

          <div class="filter-stats">
            <div class="stat-badge pending">
              <span class="badge-number">{{ getFilteredStatusCount('Pending') }}</span>
              <span class="badge-label">Pending</span>
            </div>
            <div class="stat-badge applied">
              <span class="badge-number">{{ getFilteredStatusCount('Applied') }}</span>
              <span class="badge-label">Applied</span>
            </div>
            <div class="stat-badge total">
              <span class="badge-number">{{ displayedApplications.length }}</span>
              <span class="badge-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      <!-- URL-Based Job Extraction -->
      <div *ngIf="showUrlForm" class="url-form">
        <div class="form-header">
          <h3>🔗 Add Application from URL</h3>
          <p class="form-subtitle">Paste a job posting URL from LinkedIn, Indeed, Dice, or other job portals</p>
        </div>
        <div class="url-input-row">
          <input 
            [(ngModel)]="jobUrl" 
            name="jobUrl" 
            placeholder="https://www.linkedin.com/jobs/view/..." 
            type="url"
            class="url-input">
          <button 
            (click)="extractFromUrl()" 
            [disabled]="!jobUrl || isExtracting"
            class="extract-btn">
            <span *ngIf="!isExtracting">🔍 Extract Details</span>
            <span *ngIf="isExtracting">⏳ Extracting...</span>
          </button>
        </div>

        <!-- Extracted Job Preview -->
        <div *ngIf="extractedJob" class="extracted-preview">
          <div class="preview-header">
            <h4>✅ Extracted Job Details</h4>
            <span *ngIf="isAlreadyApplied" class="already-applied-badge">⚠️ Already Applied</span>
            <span *ngIf="!isAlreadyApplied" class="new-job-badge">✨ New Job - Ready to Save!</span>
          </div>
          <div class="preview-details">
            <div class="detail-row">
              <span class="detail-icon">🏢</span>
              <p><strong>Company:</strong> {{ extractedJob.company_name || 'N/A' }}</p>
            </div>
            <div class="detail-row">
              <span class="detail-icon">💼</span>
              <p><strong>Job Title:</strong> {{ extractedJob.job_title || 'N/A' }}</p>
            </div>
            <div class="detail-row">
              <span class="detail-icon">🌐</span>
              <p><strong>Job Portal:</strong> {{ extractedJob.job_portal || 'N/A' }}</p>
            </div>
            <div class="detail-row" *ngIf="extractedJob.job_url">
              <span class="detail-icon">🔗</span>
              <p>
                <strong>Job URL:</strong> 
                <a [href]="extractedJob.job_url" target="_blank" class="job-url-link">
                  🔗 Open Job Posting
                </a>
              </p>
            </div>
            <div class="detail-row">
              <span class="detail-icon">📊</span>
              <p><strong>Status:</strong> 
                <select [(ngModel)]="extractedJobStatus" class="status-selector" *ngIf="!isAlreadyApplied">
                  <option value="Pending">📋 Pending - Haven't Applied Yet</option>
                  <option value="Applied">📤 Applied - Already Submitted</option>
                </select>
                <span *ngIf="isAlreadyApplied" class="status-display">{{ extractedJob.status }}</span>
              </p>
            </div>
            <div class="detail-row" *ngIf="extractedJob.applied_date">
              <span class="detail-icon">📅</span>
              <p><strong>Applied Date:</strong> {{ extractedJob.applied_date }}</p>
            </div>
            <div class="detail-row" *ngIf="extractedJob.notes">
              <span class="detail-icon">📝</span>
              <p><strong>Notes:</strong> {{ extractedJob.notes }}</p>
            </div>
          </div>
          <div class="preview-actions" *ngIf="!isAlreadyApplied">
            <p class="success-message">✓ Job details extracted! Verify the status below and confirm.</p>
            <button type="button" (click)="confirmAndSaveExtractedJob()" class="save-btn">💾 Confirm & Save</button>
            <button type="button" (click)="clearExtraction()" class="clear-btn">Cancel</button>
          </div>
          <div class="preview-actions" *ngIf="isAlreadyApplied">
            <p class="info-message">ℹ️ This job has already been added to your applications.</p>
            <button (click)="clearExtraction()" class="clear-btn">➕ Add Another</button>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="extractionError" class="error-message">
          <p>❌ {{ extractionError }}</p>
        </div>
      </div>

      <!-- Add Form -->
      <form *ngIf="showForm" (ngSubmit)="addApplication()" class="add-form">
        <div class="form-header">
          <h3>✏️ Add New Application Manually</h3>
          <p class="form-subtitle">Fill in the job details manually</p>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label>🏢 Company Name</label>
            <input [(ngModel)]="newApp.company_name" name="company_name" placeholder="e.g., Google" required>
          </div>
          <div class="input-group">
            <label>💼 Job Title</label>
            <input [(ngModel)]="newApp.job_title" name="job_title" placeholder="e.g., Software Engineer" required>
          </div>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label>🔗 Job URL (Optional)</label>
            <input [(ngModel)]="newApp.job_url" name="job_url" placeholder="https://..." type="url">
          </div>
          <div class="input-group">
            <label>🌐 Job Portal</label>
            <input [(ngModel)]="newApp.job_portal" name="job_portal" placeholder="e.g., LinkedIn">
          </div>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label>📊 Status</label>
            <select [(ngModel)]="newApp.status" name="status" required>
              <option value="Pending">📋 Pending</option>
              <option value="Applied">📤 Applied</option>
              <option value="Interviewing">💼 Interviewing</option>
              <option value="Rejected">❌ Rejected</option>
              <option value="Offered">🎉 Offered</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label>📅 Applied Date</label>
            <input type="date" [(ngModel)]="dateAppliedString" name="applied_date" placeholder="Applied Date" required>
          </div>
          <div class="input-group">
            <label>📝 Notes (Optional)</label>
            <input [(ngModel)]="newApp.notes" name="notes" placeholder="Any additional notes...">
          </div>
        </div>
        <div class="form-row">
          <button type="submit" class="submit-btn">➕ Add Application</button>
        </div>
      </form>

      <!-- Applications List -->
      <div class="applications-section">
        <div class="section-header">
          <h3>📋 Your Applications ({{ displayedApplications.length }})</h3>
        </div>
        
        <div *ngIf="!isLoading && displayedApplications.length === 0 && !connectionError" class="no-applications">
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No Applications Found</h3>
            <p>Try adjusting your filters or add new applications to get started!</p>
            <div class="empty-actions">
              <button (click)="showUrlForm = true" class="empty-action-btn primary">🔗 Add from URL</button>
              <button (click)="showForm = true" class="empty-action-btn">✏️ Add Manually</button>
            </div>
          </div>
        </div>
        
        <div class="applications">
          <div *ngFor="let app of displayedApplications" class="app-card" [class]="getStatusClass(app.status || 'applied')">
            <div class="card-ribbon" [class]="getRibbonClass(app.status || 'applied')">
              {{ getStatusIcon(app.status || 'applied') }}
            </div>
            <div class="app-header">
              <div class="header-main">
                <h4>{{ app.job_title }}</h4>
                <span class="company-name">🏢 {{ app.company_name }}</span>
              </div>
              <span class="status-badge" [class]="getStatusClass(app.status || 'applied')">
                {{ app.status || 'N/A' }}
              </span>
            </div>
            <div class="app-details">
              <div class="detail-item">
                <span class="detail-icon">🌐</span>
                <span class="detail-text"><strong>Portal:</strong> {{ app.job_portal || 'N/A' }}</span>
              </div>
              <div class="detail-item" *ngIf="app.job_url">
                <span class="detail-icon">🔗</span>
                <span class="detail-text">
                  <a [href]="app.job_url" target="_blank" class="job-url-link">
                    <strong>View Job Posting</strong>
                  </a>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📅</span>
                <span class="detail-text"><strong>Applied:</strong> {{ app.applied_date || 'N/A' }}</span>
              </div>
              <div class="detail-item" *ngIf="app.notes">
                <span class="detail-icon">📝</span>
                <span class="detail-text"><strong>Notes:</strong> {{ app.notes }}</span>
              </div>
            </div>
            <div class="app-actions">
              <div class="status-update">
                <label>Update:</label>
                <select [value]="app.status" (change)="updateStatus(app.id, $event)">
                  <option value="Pending">📋 Pending</option>
                  <option value="Applied">📤 Applied</option>
                  <option value="Interviewing">💼 Interviewing</option>
                  <option value="Offered">🎉 Offered</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>
              <button (click)="deleteApplication(app.id)" class="delete-btn" title="Delete Application">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * {
      box-sizing: border-box;
    }

    .app {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 25px 30px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      flex-direction: column;
    }

    .header-right {
      display: flex;
      gap: 12px;
    }

    h1 {
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 2em;
      font-weight: 800;
    }

    .welcome-text {
      color: #666;
      font-size: 1em;
      margin-top: 8px;
      font-weight: 500;
    }

    .btn-icon {
      font-size: 1.1em;
      margin-right: 5px;
    }

    .add-btn, .logout-btn, .url-btn {
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95em;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }

    .url-btn {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
    }

    .url-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(23,162,184,0.3);
    }

    .add-btn {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0,123,255,0.3);
    }

    .logout-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    }

    .logout-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(220,53,69,0.3);
    }

    .connection-error {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      padding: 20px 25px;
      border-radius: 12px;
      border-left: 5px solid #dc3545;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .retry-btn {
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .retry-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(40,167,69,0.3);
    }

    .loading-message {
      background: white;
      padding: 50px;
      border-radius: 15px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      text-align: center;
    }

    .loading-message p {
      margin: 20px 0 0 0;
      color: #666;
      font-size: 1.2em;
      font-weight: 500;
    }

    .spinner {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #667eea;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Simplified Filter Section */
    .filter-section {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .filter-container {
      display: flex;
      gap: 25px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      font-weight: 600;
      font-size: 0.95em;
    }

    .filter-icon {
      font-size: 1.3em;
    }

    .filter-label {
      color: #555;
    }

    .filter-select {
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1em;
      background: white;
      cursor: pointer;
      transition: all 0.3s;
      color: #333;
      font-weight: 500;
    }

    .filter-select:hover {
      border-color: #667eea;
      background: linear-gradient(135deg, #f8f9ff 0%, #eff0ff 100%);
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.2);
    }

    .filter-stats {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px 20px;
      border-radius: 12px;
      font-weight: 600;
      min-width: 100px;
    }

    .stat-badge.pending {
      background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
      color: #856404;
      border: 2px solid #ffc107;
    }

    .stat-badge.applied {
      background: linear-gradient(135deg, #e7f3ff 0%, #cfe2ff 100%);
      color: #007bff;
      border: 2px solid #0d6efd;
    }

    .stat-badge.total {
      background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
      color: #666;
      border: 2px solid #999;
    }

    .badge-number {
      font-size: 2em;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 5px;
    }

    .badge-label {
      font-size: 0.85em;
      opacity: 0.9;
    }

    /* Forms */
    .url-form,
    .add-form {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      border-left: 5px solid #667eea;
      animation: slideDown 0.3s ease;
    }

    .form-header h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1.5em;
    }

    .form-subtitle {
      color: #666;
      margin: 0 0 20px 0;
      font-size: 0.95em;
    }

    .url-input-row {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .url-input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1em;
      transition: all 0.3s;
    }

    .url-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .extract-btn {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(23,162,184,0.2);
    }

    .extract-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(23,162,184,0.3);
    }

    .extract-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Preview */
    .extracted-preview {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      border-radius: 12px;
      border: 2px solid #dee2e6;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 2px solid #dee2e6;
    }

    .preview-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.3em;
    }

    .already-applied-badge,
    .new-job-badge {
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 700;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .already-applied-badge {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }

    .new-job-badge {
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
    }

    .preview-details {
      display: grid;
      gap: 15px;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .detail-icon {
      font-size: 1.3em;
      flex-shrink: 0;
    }

    .detail-row p {
      margin: 0;
      color: #555;
      font-size: 1em;
      line-height: 1.5;
    }

    .detail-row strong {
      color: #333;
      font-weight: 600;
    }

    .status-selector {
      padding: 8px 12px;
      border: 2px solid #667eea;
      border-radius: 6px;
      font-size: 0.95em;
      background: white;
      cursor: pointer;
      margin-left: 8px;
      transition: all 0.3s;
      color: #333;
    }

    .status-selector:hover {
      background: linear-gradient(135deg, #f0f4ff 0%, #e8ecff 100%);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    }

    .status-selector:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.2);
    }

    .status-display {
      color: #667eea;
      font-weight: 600;
      padding: 6px 12px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 6px;
      display: inline-block;
      margin-left: 8px;
    }

    .job-url-link {
      color: #007bff;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(0, 123, 255, 0.1);
    }

    .job-url-link:hover {
      color: #0056b3;
      background: rgba(0, 123, 255, 0.2);
      transform: translateX(2px);
    }

    .preview-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      align-items: center;
      flex-wrap: wrap;
    }

    .save-btn {
      flex: 1;
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 10px rgba(40,167,69,0.2);
      min-width: 200px;
    }

    .save-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(40,167,69,0.3);
    }

    .clear-btn {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4px 10px rgba(108,117,125,0.2);
      flex: 1;
      min-width: 150px;
    }

    .clear-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(108,117,125,0.3);
    }

    .error-message {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      padding: 18px 22px;
      border-radius: 10px;
      border-left: 5px solid #dc3545;
      margin-top: 15px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    }

    .error-message p {
      margin: 0;
      font-size: 1em;
      font-weight: 500;
    }

    .success-message {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      padding: 15px 18px;
      border-radius: 10px;
      border-left: 5px solid #28a745;
      margin: 0 0 15px 0;
      font-weight: 500;
    }

    .info-message {
      color: #856404;
      font-size: 1em;
      margin: 0;
      font-weight: 500;
    }

    /* Form Styling */
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    .input-group label {
      margin-bottom: 8px;
      color: #666;
      font-weight: 600;
      font-size: 0.95em;
    }

    .input-group input,
    .input-group select {
      padding: 14px 18px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 1em;
      transition: all 0.3s;
    }

    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .submit-btn {
      width: 100%;
      background: linear-gradient(135deg, #28a745 0%, #218838 100%);
      color: white;
      border: none;
      padding: 16px 28px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1.1em;
      font-weight: 700;
      transition: all 0.3s;
      box-shadow: 0 5px 15px rgba(40,167,69,0.2);
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(40,167,69,0.3);
    }

    /* Applications Section */
    .applications-section {
      margin-top: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 0 10px;
    }

    .section-header h3 {
      color: white;
      font-size: 1.5em;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      margin: 0;
    }

    /* Empty State */
    .no-applications {
      background: white;
      padding: 60px 40px;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      text-align: center;
    }

    .empty-state {
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 5em;
      margin-bottom: 20px;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    }

    .empty-state h3 {
      color: #333;
      font-size: 1.8em;
      margin: 0 0 15px 0;
    }

    .empty-state p {
      color: #666;
      font-size: 1.1em;
      margin: 0 0 30px 0;
    }

    .empty-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .empty-action-btn {
      padding: 14px 28px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1em;
      transition: all 0.3s;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .empty-action-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .empty-action-btn:not(.primary) {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .empty-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(0,0,0,0.15);
    }

    /* Application Cards */
    .applications {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .app-card {
      background: white;
      padding: 22px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border-left: 4px solid;
    }

    .app-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }

    .app-card.applied { border-left-color: #007bff; }
    .app-card.pending { border-left-color: #ffc107; }
    .app-card.interviewing { border-left-color: #17a2b8; }
    .app-card.offered { border-left-color: #28a745; }
    .app-card.rejected { border-left-color: #dc3545; }

    .card-ribbon {
      position: absolute;
      top: 12px;
      right: -20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 25px;
      transform: rotate(45deg);
      font-size: 1em;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .header-main {
      flex: 1;
      padding-right: 35px;
    }

    .app-header h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.15em;
      font-weight: 700;
      line-height: 1.3;
    }

    .company-name {
      display: inline-block;
      color: #666;
      font-size: 0.95em;
      font-weight: 500;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75em;
      font-weight: 700;
      text-transform: uppercase;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      white-space: nowrap;
    }

    .status-badge.applied {
      background: linear-gradient(135deg, #e7f3ff 0%, #cfe2ff 100%);
      color: #007bff;
    }
    .status-badge.pending {
      background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
      color: #856404;
    }
    .status-badge.interviewing {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      color: #0c5460;
    }
    .status-badge.offered {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
    }
    .status-badge.rejected {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
    }

    .app-details {
      display: grid;
      gap: 10px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 6px;
      transition: background 0.3s;
      font-size: 0.9em;
    }

    .detail-item:hover {
      background: #eff0f2;
    }

    .detail-icon {
      font-size: 1.1em;
      flex-shrink: 0;
    }

    .detail-text {
      color: #555;
      font-size: 0.9em;
      line-height: 1.4;
    }

    .detail-text strong {
      color: #333;
      font-weight: 600;
    }

    .detail-id {
      color: #999;
      font-size: 0.8em;
    }

    .app-actions {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .status-update {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .status-update label {
      font-size: 0.8em;
      color: #666;
      font-weight: 600;
    }

    .status-update select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.9em;
      background: white;
    }

    .status-update select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102,126,234,0.1);
    }

    .delete-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(220,53,69,0.2);
      align-self: flex-end;
      font-size: 0.9em;
    }

    .delete-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(220,53,69,0.3);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .app {
        padding: 15px;
      }

      header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .header-right {
        flex-direction: column;
        width: 100%;
      }

      .header-right button {
        width: 100%;
      }

      h1 {
        font-size: 1.5em;
      }

      .filter-container {
        flex-direction: column;
        gap: 15px;
      }

      .filter-group {
        width: 100%;
      }

      .filter-stats {
        width: 100%;
        justify-content: space-around;
      }

      .applications {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .url-input-row {
        flex-direction: column;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  applications: JobApplication[] = [];
  activeApplications: JobApplication[] = [];
  displayedApplications: JobApplication[] = [];
  portalStats: PortalStatusCount[] = [];
  portalOptions: string[] = ['All Portals'];
  selectedPortal = 'All Portals';
  selectedStatus = 'All';
  statusOptions = ['All', 'Pending', 'Applied'];
  showForm = false;
  showUrlForm = false;
  newApp: Partial<JobApplicationCreate> = {
    company_name: '',
    job_title: '',
    job_url: '',
    job_portal: '',
    status: 'Pending',
    applied_date: undefined,
    notes: ''
  };
  dateAppliedString = '';
  currentUser: User | null = null;
  nextId = 1;

  // URL extraction properties
  jobUrl = '';
  extractedJob: JobApplication | null = null;
  extractedJobStatus = 'Applied'; // Default status for extracted jobs
  isExtracting = false;
  isAlreadyApplied = false;
  extractionError = '';

  // Loading and error states
  isLoading = false;
  connectionError: string | null = null;

  constructor(
    private jobApplicationService: JobApplicationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Subscribe to applications
    this.jobApplicationService.getApplications().subscribe(apps => {
      console.log('Dashboard: Received applications', apps);
      this.applications = apps;
      this.refreshPortalData();
      if (apps.length > 0) {
        this.nextId = Math.max(...apps.map(a => a.id)) + 1;
      }
    });

    // Subscribe to loading state
    this.jobApplicationService.loading$.subscribe(loading => {
      console.log('Dashboard: Loading state changed to', loading);
      this.isLoading = loading;
    });

    // Subscribe to error state
    this.jobApplicationService.error$.subscribe(error => {
      console.log('Dashboard: Error state changed to', error);
      this.connectionError = error;
    });
  }

  addApplication() {
    if (this.newApp.company_name && this.newApp.job_title && this.dateAppliedString) {
      const newApplication: JobApplicationCreate = {
        company_name: this.newApp.company_name,
        job_title: this.newApp.job_title,
        job_portal: this.newApp.job_portal,
        status: this.newApp.status || 'Pending',
        applied_date: this.dateAppliedString,
        notes: this.newApp.notes
      };

      this.jobApplicationService.addApplication(newApplication).subscribe({
        next: (result) => {
          console.log('Application added:', result);
          // Reset form
          this.newApp = {
            company_name: '',
            job_title: '',
            job_portal: '',
            status: 'Pending',
            applied_date: undefined,
            notes: ''
          };
          this.dateAppliedString = '';
          this.showForm = false;
        },
        error: (err) => console.error('Error adding application:', err)
      });
    }
  }

  updateStatus(id: number, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    this.jobApplicationService.updateApplication(id, { status: newStatus }).subscribe({
      next: (result) => {
        console.log('Status updated:', result);
        // If status is changed to 'Rejected', remove it from displayed applications
        if (newStatus === 'Rejected') {
          this.displayedApplications = this.displayedApplications.filter(app => app.id !== id);
        }
      },
      error: (err) => console.error('Error updating status:', err)
    });
  }

  deleteApplication(id: number) {
    this.jobApplicationService.deleteApplication(id).subscribe({
      next: () => console.log('Application deleted'),
      error: (err) => console.error('Error deleting application:', err)
    });
  }

  getStatusCount(status: string): number {
    return this.applications.filter(app => app.status === status).length;
  }

  getFilteredStatusCount(status: string): number {
    return this.displayedApplications.filter(app => app.status === status).length;
  }

  getStatusClass(status: string | undefined): string {
    return status ? status.toLowerCase() : 'applied';
  }

  extractFromUrl() {
    if (!this.jobUrl) {
      this.extractionError = 'Please enter a valid job posting URL';
      return;
    }

    // Validate URL format
    try {
      new URL(this.jobUrl);
    } catch {
      this.extractionError = 'Please enter a valid URL (e.g., https://www.linkedin.com/jobs/view/...)';
      return;
    }

    this.isExtracting = true;
    this.extractionError = '';
    this.extractedJob = null;
    this.extractedJobStatus = 'Applied'; // Reset to default

    const urlRequest: JobURLRequest = {
      job_url: this.jobUrl
    };

    this.jobApplicationService.addApplicationFromURL(urlRequest).subscribe({
      next: (result) => {
        this.isExtracting = false;
        this.extractedJob = result;
        this.extractedJobStatus = result.status || 'Applied'; // Set initial status from extracted job
        
        // Check if this job is already in the applications list
        this.checkIfAlreadyApplied(result);
        
        // Clear the input field to show extraction was successful
        this.jobUrl = '';
        
        console.log('Job extracted and saved:', result);
      },
      error: (err) => {
        this.isExtracting = false;
        
        // Extract error message from backend response
        let errorMessage = 'Failed to extract job details.';
        
        if (err.error && err.error.detail) {
          errorMessage = err.error.detail;
        } else if (err.statusText) {
          errorMessage = `Error: ${err.statusText}`;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.extractionError = errorMessage;
        console.error('Error extracting job:', err);
      }
    });
  }

  confirmAndSaveExtractedJob() {
    if (this.extractedJob && this.extractedJob.id) {
      // Update the status if it's different from the current status
      if (this.extractedJobStatus !== this.extractedJob.status) {
        this.jobApplicationService.updateApplication(this.extractedJob.id, { 
          status: this.extractedJobStatus 
        }).subscribe({
          next: () => {
            console.log('Status updated to:', this.extractedJobStatus);
            this.clearExtraction();
          },
          error: (err) => {
            console.error('Error updating status:', err);
            // Still clear extraction even if status update fails
            this.clearExtraction();
          }
        });
      } else {
        // Status unchanged, just clear
        this.clearExtraction();
      }
    }
  }

  checkIfAlreadyApplied(job: JobApplication) {
    // Check if a similar job already exists in applications
    // We'll consider it a duplicate if company_name and job_title match
    const exists = this.applications.some(app => 
      app.company_name?.toLowerCase() === job.company_name?.toLowerCase() &&
      app.job_title?.toLowerCase() === job.job_title?.toLowerCase() &&
      app.id !== job.id // Exclude the current job itself
    );
    
    this.isAlreadyApplied = exists;
  }

  clearExtraction() {
    this.jobUrl = '';
    this.extractedJob = null;
    this.extractedJobStatus = 'Applied'; // Reset to default
    this.isAlreadyApplied = false;
    this.extractionError = '';
    this.showUrlForm = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  retryConnection(): void {
    console.log('Dashboard: Retrying connection...');
    this.connectionError = null;
    window.location.reload();
  }

  getSuccessRate(): number {
    if (this.displayedApplications.length === 0) return 0;
    const successCount = this.getFilteredStatusCount('Offered');
    return Math.round((successCount / this.displayedApplications.length) * 100);
  }

  getApplicationProgress(): number {
    if (this.displayedApplications.length === 0) return 0;
    const interviewingCount = this.getFilteredStatusCount('Interviewing');
    const offeredCount = this.getFilteredStatusCount('Offered');
    const totalProgress = interviewingCount + offeredCount;
    return Math.min(Math.round((totalProgress / this.displayedApplications.length) * 100), 100);
  }

  getProgressMessage(): string {
    const progress = this.getApplicationProgress();
    if (progress === 0) return 'Start applying to see your progress!';
    if (progress < 25) return 'Keep building momentum!';
    if (progress < 50) return 'Making good progress!';
    if (progress < 75) return 'Great work! Keep it up!';
    return 'Excellent progress!';
  }

  getStageHeight(status: string): number {
    const count = this.getFilteredStatusCount(status);
    const maxCount = Math.max(
      this.getFilteredStatusCount('Pending'),
      this.getFilteredStatusCount('Applied'),
      this.getFilteredStatusCount('Interviewing'),
      this.getFilteredStatusCount('Offered'),
      1 // Minimum to avoid division by zero
    );
    return Math.max((count / maxCount) * 150, 20); // Scale to max 150px
  }

  onPortalChange(portal: string): void {
    this.selectedPortal = portal;
    this.updateDisplayedApplications();
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.updateDisplayedApplications();
  }

  private refreshPortalData(): void {
    // Filter to show only Pending and Applied status (exclude Rejected, Interviewing, Offered for simplicity)
    this.activeApplications = this.applications.filter(app => 
      app.status === 'Pending' || app.status === 'Applied'
    );

    const statsMap = new Map<string, PortalStatusCount>();
    for (const app of this.activeApplications) {
      const portal = this.resolvePortal(app);
      if (!statsMap.has(portal)) {
        statsMap.set(portal, { portal, pending: 0, applied: 0, total: 0 });
      }

      const stats = statsMap.get(portal)!;
      if (app.status === 'Pending') {
        stats.pending += 1;
      }
      if (app.status === 'Applied') {
        stats.applied += 1;
      }
      stats.total += 1;
    }

    this.portalStats = Array.from(statsMap.values()).sort((a, b) => a.portal.localeCompare(b.portal));
    this.portalOptions = ['All Portals', ...this.portalStats.map(stat => stat.portal)];

    if (!this.portalOptions.includes(this.selectedPortal)) {
      this.selectedPortal = 'All Portals';
    }

    this.updateDisplayedApplications();
  }

  private updateDisplayedApplications(): void {
    let filtered = [...this.activeApplications];

    // Apply portal filter
    if (this.selectedPortal !== 'All Portals') {
      filtered = filtered.filter(
        app => this.resolvePortal(app) === this.selectedPortal
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(app => app.status === this.selectedStatus);
    }

    this.displayedApplications = filtered;
  }

  private resolvePortal(app: JobApplication): string {
    const explicitPortal = app.job_portal?.trim();
    if (explicitPortal) {
      return explicitPortal;
    }

    const rawUrl = app.job_url;
    if (!rawUrl) {
      return 'Unknown Portal';
    }

    return this.getPortalFromUrl(rawUrl);
  }

  private getPortalFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();

      if (hostname.includes('linkedin.')) return 'LinkedIn';
      if (hostname.includes('indeed.')) return 'Indeed';
      if (hostname.includes('glassdoor.')) return 'Glassdoor';
      if (hostname.includes('dice.')) return 'Dice';
      if (hostname.includes('monster.')) return 'Monster';
      if (hostname.includes('ziprecruiter.')) return 'ZipRecruiter';
      if (hostname.includes('naukri.')) return 'Naukri';

      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
      }

      return hostname || 'Unknown Portal';
    } catch {
      return 'Unknown Portal';
    }
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': '📋',
      'applied': '📤',
      'interviewing': '💼',
      'offered': '🎉',
      'rejected': '❌'
    };
    return icons[status.toLowerCase()] || '📄';
  }

  getRibbonClass(status: string): string {
    return `ribbon-${status.toLowerCase()}`;
  }
}
