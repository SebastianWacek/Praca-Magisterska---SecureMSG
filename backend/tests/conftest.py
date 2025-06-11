import os
import sys

# Dodaj ścieżkę do katalogu "backend", aby Python widział moduł `app`
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# In-memory SQLite z StaticPool: wszystkie sesje widzą tę samą bazę
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

@pytest.fixture(autouse=True)
def override_db():
    # Przy każdym teście twórz wszystkie tabele
    Base.metadata.create_all(bind=engine)
    def _get_test_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    # Podmieniamy dependency get_db na naszą in-memory
    app.dependency_overrides[get_db] = _get_test_db
    yield
    # Po teście usuń tabele
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)