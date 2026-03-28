from pydantic import BaseModel
from typing import Optional
from datetime import date


class JobApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    job_portal: Optional[str] = None
    status: Optional[str] = "Pending"
    applied_date: Optional[date] = None
    notes: Optional[str] = None


class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class JobApplicationResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    job_portal: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class JobURLRequest(BaseModel):
    job_url: str
