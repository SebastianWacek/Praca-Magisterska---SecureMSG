from sqlalchemy.orm import Session
from typing import List, Optional

from . import models, schemas, auth

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        language=user.language  # Przy rejestracji język domyślnie "pl" lub z JSON
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_message(db: Session, msg: schemas.MessageCreate, sender_id: int) -> models.Message:
    db_msg = models.Message(
        sender_id=sender_id,
        receiver_id=msg.receiver_id,
        encrypted=msg.encrypted,
        plain=msg.plain      # Jawny tekst do późniejszego tłumaczenia
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def get_conversation(db: Session, user1: int, user2: int) -> List[models.Message]:
    return (
        db.query(models.Message)
        .filter(
            ((models.Message.sender_id == user1) & (models.Message.receiver_id == user2)) |
            ((models.Message.sender_id == user2) & (models.Message.receiver_id == user1))
        )
        .order_by(models.Message.timestamp)
        .all()
    )