import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CORSTestResult {
  message: string;
  allowed_origins: string[];
  timestamp: string;
  status?: string;
  api?: string;
  cors?: string;
  endpoints?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class CorsTestService {
  private http = inject(HttpClient);
  private backendUrl = 'http://192.168.1.104:8000';

  /**
   * Test if backend is running and responsive
   */
  testBackendHealth(): Observable<any> {
    return this.http.get(`${this.backendUrl}/`);
  }

  /**
   * Test CORS configuration
   */
  testCors(): Observable<CORSTestResult> {
    return this.http.get<CORSTestResult>(`${this.backendUrl}/cors-test`);
  }

  /**
   * Get detailed health information
   */
  getDetailedHealth(): Observable<CORSTestResult> {
    return this.http.get<CORSTestResult>(`${this.backendUrl}/health`);
  }

  /**
   * Run all connection tests and return results
   */
  runAllTests(): Observable<{
    health: any;
    cors: CORSTestResult;
    detailed: CORSTestResult;
  }> {
    return new Observable(observer => {
      const results: any = {};

      // Test 1: Backend Health
      this.testBackendHealth().subscribe({
        next: (data) => {
          results.health = data;
          console.log('✅ Backend Health Check:', data);

          // Test 2: CORS Test
          this.testCors().subscribe({
            next: (data) => {
              results.cors = data;
              console.log('✅ CORS Test:', data);

              // Test 3: Detailed Health
              this.getDetailedHealth().subscribe({
                next: (data) => {
                  results.detailed = data;
                  console.log('✅ Detailed Health:', data);
                  observer.next(results);
                  observer.complete();
                },
                error: (err) => {
                  console.error('❌ Detailed Health Error:', err);
                  observer.next(results);
                  observer.complete();
                }
              });
            },
            error: (err) => {
              console.error('❌ CORS Test Error:', err);
              observer.next(results);
              observer.complete();
            }
          });
        },
        error: (err) => {
          console.error('❌ Backend Health Error:', err);
          if (err.status === 0) {
            console.error('🔴 Backend server is not running on port 8000');
          }
          observer.error(err);
        }
      });
    });
  }
}
