# tests/test_crud.py

from sqlalchemy.orm import Session
from app import crud, schemas
from app.main import app
from app.database import get_db

def test_create_and_get_user(override_db, client):
    # Bezpośrednio przez CRUD: pobierz sesję z override
    db: Session = next(app.dependency_overrides[get_db]())
    user_in = schemas.UserCreate(
        username="ala",
        email="ala@example.com",
        password="tajne"
    )
    user = crud.create_user(db, user_in)
    assert user.id is not None
    assert user.username == "ala"
    assert user.email == "ala@example.com"
    assert user.hashed_password != "tajne"

    fetched = crud.get_user_by_username(db, "ala")
    assert fetched.id == user.id

def test_create_message_and_conversation(override_db, client):
    db: Session = next(app.dependency_overrides[get_db]())
    # Utwórz dwóch użytkowników
    u1 = crud.create_user(db, schemas.UserCreate(
        username="u1", email="u1@e.com", password="p"
    ))
    u2 = crud.create_user(db, schemas.UserCreate(
        username="u2", email="u2@e.com", password="p"
    ))
    # Utwórz wiadomość
    msg_in = schemas.MessageCreate(
        receiver_id=u2.id,
        encrypted="[1,2,3]",
        plain="Hello"
    )
    msg = crud.create_message(db, msg_in, sender_id=u1.id)
    assert msg.id is not None
    assert msg.sender_id == u1.id

    # Pobierz konwersację
    conv = crud.get_conversation(db, u1.id, u2.id)
    assert len(conv) == 1
    assert conv[0].plain == "Hello"