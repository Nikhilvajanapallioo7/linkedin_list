export interface JobApplication {
  id: number;
  company_name: string;
  job_title: string;
  job_url?: string;  // The job posting URL
  job_portal?: string;
  status?: string;
  applied_date?: string;
  notes?: string;
}

export interface JobApplicationCreate {
  company_name: string;
  job_title: string;
  job_url?: string;  // Optional URL for manual entry
  job_portal?: string;
  status?: string;
  applied_date?: string;
  notes?: string;
}

export interface JobURLRequest {
  job_url: string;
}