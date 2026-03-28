from sqlalchemy import Column, Integer, String, Date, Text
from app.database.base import Base

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    job_portal = Column(String)
    status = Column(String)
    applied_date = Column(Date)
    notes = Column(Text)
