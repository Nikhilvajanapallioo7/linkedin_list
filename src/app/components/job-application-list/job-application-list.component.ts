import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';
import { JobApplication } from '../../models/job-application.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-job-application-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">My Job Applications</h5>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" [(ngModel)]="filterStatus" (change)="applyFilter()">
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      <div class="card-body">
        <div class="row" *ngIf="filteredApplications.length > 0; else noApplications">
          <div class="col-md-6 col-lg-4 mb-4" *ngFor="let application of filteredApplications">
            <div class="card application-item h-100">
              <div class="card-header d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="card-title mb-1">{{ application.job_title }}</h6>
                  <p class="text-muted mb-0">{{ application.company_name }}</p>
                </div>
                <span class="badge" 
                      [ngClass]="{
                        'bg-primary': application.status === 'Applied',
                        'bg-warning text-dark': application.status === 'Interviewing',
                        'bg-success': application.status === 'Offered',
                        'bg-danger': application.status === 'Rejected',
                        'bg-secondary': application.status === 'Pending'
                      }">
                  {{ application.status || 'Pending' }}
                </span>
              </div>
              
              <div class="card-body">
                <div class="mb-2" *ngIf="application.job_portal">
                  <small class="text-muted">
                    <i class="bi bi-globe me-1"></i>{{ application.job_portal }}
                  </small>
                </div>
                
                <div class="mb-2" *ngIf="application.applied_date">
                  <small class="text-muted">
                    <i class="bi bi-calendar me-1"></i>Applied: {{ application.applied_date }}
                  </small>
                </div>
                
                <div class="mb-3" *ngIf="application.notes">
                  <small class="text-muted">
                    <i class="bi bi-card-text me-1"></i>{{ application.notes }}
                  </small>
                </div>
                
                <div class="d-flex flex-wrap gap-1" *ngIf="application.id">
                  <span class="badge bg-light text-dark border">
                    <i class="bi bi-hash"></i>{{ application.id }}
                  </span>
                </div>
              </div>
              
              <div class="card-footer">
                <div class="d-flex justify-content-between align-items-center">
                  <select class="form-select form-select-sm" 
                          [value]="application.status"
                          (change)="updateStatus(application.id, $event)">
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  
                  <button class="btn btn-outline-danger btn-sm" 
                          (click)="deleteApplication(application.id)"
                          title="Delete Application">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template #noApplications>
          <div class="text-center py-5">
            <i class="bi bi-briefcase display-1 text-muted"></i>
            <h4 class="text-muted mt-3">No Job Applications Found</h4>
            <p class="text-muted">
              {{ filterStatus ? 'No applications match the selected filter.' : 'Start by adding your first job application!' }}
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class JobApplicationListComponent implements OnInit {
  applications: JobApplication[] = [];
  filteredApplications: JobApplication[] = [];
  filterStatus: string = '';

  constructor(private jobApplicationService: JobApplicationService) {}

  ngOnInit(): void {
    this.jobApplicationService.getApplications().subscribe(applications => {
      this.applications = applications;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    if (this.filterStatus) {
      this.filteredApplications = this.applications.filter(
        app => app.status === this.filterStatus
      );
    } else {
      this.filteredApplications = [...this.applications];
    }
  }

  updateStatus(applicationId: number, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as JobApplication['status'];
    
    this.jobApplicationService.updateApplication(applicationId, { status: newStatus });
  }

  deleteApplication(applicationId: number): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.jobApplicationService.deleteApplication(applicationId);
    }
  }
}