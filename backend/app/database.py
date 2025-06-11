# database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("W pliku .env musisz mieć ustawioną zmienną DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    # Jeśli używasz SQLite do testów, odkomentuj poniższą linię:
    # connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ======== NOWOŚĆ: funkcja get_db zamiast w main.py ========
def get_db() -> Session:
    """
    Dependencja dla FastAPI: tworzy i zamyka sesję bazy danych.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()