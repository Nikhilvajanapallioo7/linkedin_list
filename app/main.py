from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.database.session import engine
from app.database.base import Base

from app.api.v1.job_application import router as jobs_router
from app.api.v1.auth import router as auth_router

logger = logging.getLogger(__name__)

app = FastAPI(title="JobTrackX API")

# CORS configuration (for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",   # Angular
        "http://localhost:3000",   # React
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
except SQLAlchemyError as exc:
    logger.warning("Database initialization failed: %s", exc)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(jobs_router, prefix="/api/v1/job-applications", tags=["Job Applications"])


# Health check endpoint
@app.get("/")
def root():
    return {"message": "JobTrackX API is running"}