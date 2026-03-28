import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JobApplication, JobApplicationCreate, JobURLRequest } from '../models/job-application.model';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://192.168.1.104:8000/api/v1/job-applications';
  
  private applicationsSubject = new BehaviorSubject<JobApplication[]>([]);
  public applications$ = this.applicationsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor() {
    console.log('JobApplicationService: Starting to load applications from', this.apiUrl);
    this.loadApplications();
  }

  private loadApplications(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    console.log('JobApplicationService: Fetching from', this.apiUrl);
    
    this.http.get<JobApplication[]>(this.apiUrl).subscribe({
      next: (apps) => {
        console.log('JobApplicationService: Successfully loaded', apps.length, 'applications', apps);
        this.applicationsSubject.next(apps);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('JobApplicationService: Error loading applications:', err);
        console.error('JobApplicationService: Error details:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          url: err.url
        });
        
        let errorMessage = 'Failed to load applications. ';
        if (err.status === 0) {
          errorMessage += 'Cannot connect to backend server. Please check if the backend is running at ' + this.apiUrl;
        } else if (err.status === 404) {
          errorMessage += 'API endpoint not found.';
        } else if (err.status === 500) {
          errorMessage += 'Backend server error.';
        } else {
          errorMessage += err.message;
        }
        
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        this.applicationsSubject.next([]); // Set empty array on error
      }
    });
  }

  getApplications(): Observable<JobApplication[]> {
    return this.applications$;
  }

  addApplication(applicationData: JobApplicationCreate): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, applicationData).pipe(
      tap(() => this.loadApplications())
    );
  }

  addApplicationFromURL(urlData: JobURLRequest): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${this.apiUrl}/from-url`, urlData).pipe(
      tap(() => this.loadApplications())
    );
  }

  updateApplication(id: number, updates: { status?: string; notes?: string }): Observable<JobApplication> {
    return this.http.patch<JobApplication>(`${this.apiUrl}/${id}`, updates).pipe(
      tap(() => this.loadApplications())
    );
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadApplications())
    );
  }

  getApplicationById(id: number): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  getApplicationsByStatus(status: string): JobApplication[] {
    return this.applicationsSubject.value.filter(app => app.status === status);
  }

  getApplicationStats() {
    const apps = this.applicationsSubject.value;
    return {
      total: apps.length,
      applied: apps.filter(app => app.status === 'Applied').length,
      pending: apps.filter(app => app.status === 'Pending').length,
      rejected: apps.filter(app => app.status === 'Rejected').length
    };
  }
}