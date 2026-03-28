from fastapi import APIRouter, Depends, status, Body, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models.job_application import JobApplication
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationUpdate,
    JobURLRequest
)
from app.utils.job_extractor import extract_job_details

router = APIRouter(tags=["Job Applications"])


# -------------------------
# EXTRACT FROM URL + SAVE
# -------------------------
@router.post("/from-url", response_model=JobApplicationResponse)
def create_job_from_url(payload: JobURLRequest, db: Session = Depends(get_db)):
    extracted = extract_job_details(payload.job_url)

    if not extracted.get("job_title"):
        raise HTTPException(status_code=400, detail="Could not extract job details")

    job_portal = extracted.get("job_portal")

    # Dynamic notes based on portal
    if job_portal:
        if "linkedin" in job_portal.lower():
            notes = "Created via LinkedIn"
        elif "dice" in job_portal.lower():
            notes = "Created via Dice"
        else:
            notes = f"Created via {job_portal}"
    else:
        notes = "Created via URL extraction"

    job = JobApplication(
        company_name=extracted.get("company_name"),
        job_title=extracted.get("job_title"),
        job_portal=job_portal,
        status="Applied",
        applied_date=extracted.get("applied_date"),
        notes=notes
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job



# -------------------------
# CREATE (MANUAL)
# -------------------------
@router.post("/", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_job_application(
    payload: JobApplicationCreate = Body(...),
    db: Session = Depends(get_db)
):
    job = JobApplication(
        company_name=payload.company_name,
        job_title=payload.job_title,
        job_portal=payload.job_portal,
        status=payload.status,
        applied_date=payload.applied_date,
        notes=payload.notes
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


# -------------------------
# READ ALL
# -------------------------
@router.get("/", response_model=list[JobApplicationResponse])
def get_all_job_applications(db: Session = Depends(get_db)):
    return db.query(JobApplication).order_by(JobApplication.id.desc()).all()


# -------------------------
# READ BY ID
# -------------------------
@router.get("/{job_id}", response_model=JobApplicationResponse)
def get_job_application_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job application not found")

    return job


# -------------------------
# UPDATE
# -------------------------
@router.patch("/{job_id}", response_model=JobApplicationResponse)
def update_job_application(
    job_id: int,
    payload: JobApplicationUpdate,
    db: Session = Depends(get_db)
):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job application not found")

    if payload.status is not None:
        job.status = payload.status

    if payload.notes is not None:
        job.notes = payload.notes

    db.commit()
    db.refresh(job)

    return job


# -------------------------
# DELETE
# -------------------------
@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_application(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobApplication).filter(JobApplication.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job application not found")

    db.delete(job)
    db.commit()
    return None
