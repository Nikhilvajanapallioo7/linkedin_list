import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Prefer env-configured DB URL; default to common local Postgres port 5432.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres123@localhost:5433/jobtrackx",
)

# Support Heroku-style postgres:// values.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

sql_echo = os.getenv("SQL_ECHO", "false").lower() == "true"

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=sql_echo,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(DATABASE_URL, echo=sql_echo, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()