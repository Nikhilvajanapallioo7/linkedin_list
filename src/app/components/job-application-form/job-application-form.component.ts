import { Component, EventEmitter, Output } from '@angular/core'; import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../services/job-application.service';
import { JobApplicationCreate } from '../../models/job-application.model';

@Component({
  selector: 'app-job-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="applicationForm" (ngSubmit)="onSubmit()">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="company" class="form-label">Company *</label>
          <input 
            type="text" 
            class="form-control" 
            id="company" 
            formControlName="company"
            [class.is-invalid]="isFieldInvalid('company')">
          <div class="invalid-feedback" *ngIf="isFieldInvalid('company')">
            Company name is required
          </div>
        </div>
        
        <div class="col-md-6 mb-3">
          <label for="position" class="form-label">Position *</label>
          <input 
            type="text" 
            class="form-control" 
            id="position" 
            formControlName="position"
            [class.is-invalid]="isFieldInvalid('position')">
          <div class="invalid-feedback" *ngIf="isFieldInvalid('position')">
            Position is required
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-4 mb-3">
          <label for="status" class="form-label">Status *</label>
          <select 
            class="form-select" 
            id="status" 
            formControlName="status"
            [class.is-invalid]="isFieldInvalid('status')">
            <option value="">Select Status</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div class="invalid-feedback" *ngIf="isFieldInvalid('status')">
            Please select a status
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <label for="priority" class="form-label">Priority *</label>
          <select 
            class="form-select" 
            id="priority" 
            formControlName="priority"
            [class.is-invalid]="isFieldInvalid('priority')">
            <option value="">Select Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <div class="invalid-feedback" *ngIf="isFieldInvalid('priority')">
            Please select a priority
          </div>
        </div>
        
        <div class="col-md-4 mb-3">
          <label for="dateApplied" class="form-label">Date Applied *</label>
          <input 
            type="date" 
            class="form-control" 
            id="dateApplied" 
            formControlName="dateApplied"
            [class.is-invalid]="isFieldInvalid('dateApplied')">
          <div class="invalid-feedback" *ngIf="isFieldInvalid('dateApplied')">
            Date applied is required
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="location" class="form-label">Location *</label>
          <input 
            type="text" 
            class="form-control" 
            id="location" 
            formControlName="location" 
            placeholder="e.g., San Francisco, CA or Remote"
            [class.is-invalid]="isFieldInvalid('location')">
          <div class="invalid-feedback" *ngIf="isFieldInvalid('location')">
            Location is required
          </div>
        </div>
        
        <div class="col-md-6 mb-3">
          <label for="salary" class="form-label">Expected Salary</label>
          <input 
            type="number" 
            class="form-control" 
            id="salary" 
            formControlName="salary" 
            placeholder="e.g., 75000">
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="contactPerson" class="form-label">Contact Person</label>
          <input 
            type="text" 
            class="form-control" 
            id="contactPerson" 
            formControlName="contactPerson" 
            placeholder="e.g., John Smith">
        </div>
        
        <div class="col-md-6 mb-3">
          <label for="jobUrl" class="form-label">Job URL</label>
          <input 
            type="url" 
            class="form-control" 
            id="jobUrl" 
            formControlName="jobUrl" 
            placeholder="https://company.com/careers/job-id">
        </div>
      </div>

      <div class="mb-3">
        <label for="notes" class="form-label">Notes</label>
        <textarea 
          class="form-control" 
          id="notes" 
          formControlName="notes" 
          rows="3" 
          placeholder="Additional notes about the application..."></textarea>
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" [disabled]="applicationForm.invalid">
          <i class="bi bi-plus-circle me-1"></i>
          Add Application
        </button>
        <button type="button" class="btn btn-outline-secondary" (click)="onCancel()">
          Cancel
        </button>
      </div>
    </form>
  `
})
export class JobApplicationFormComponent {
  @Output() applicationAdded = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  applicationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private jobApplicationService: JobApplicationService
  ) {
    this.applicationForm = this.fb.group({
      company: ['', Validators.required],
      position: ['', Validators.required],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      dateApplied: ['', Validators.required],
      location: ['', Validators.required],
      salary: [null],
      contactPerson: [''],
      jobUrl: [''],
      notes: ['']
    });

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    this.applicationForm.patchValue({ dateApplied: today });
  }

  onSubmit(): void {
    if (this.applicationForm.valid) {
      const formValue = this.applicationForm.value;
      
      const newApplication: JobApplicationCreate = {
        ...formValue,
        dateApplied: new Date(formValue.dateApplied),
        salary: formValue.salary ? Number(formValue.salary) : undefined
      };

      this.jobApplicationService.addApplication(newApplication);
      this.applicationForm.reset();
      
      // Set default date again after reset
      const today = new Date().toISOString().split('T')[0];
      this.applicationForm.patchValue({ dateApplied: today });
      
      this.applicationAdded.emit();
    }
  }

  onCancel(): void {
    this.applicationForm.reset();
    const today = new Date().toISOString().split('T')[0];
    this.applicationForm.patchValue({ dateApplied: today });
    this.cancelled.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.applicationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}