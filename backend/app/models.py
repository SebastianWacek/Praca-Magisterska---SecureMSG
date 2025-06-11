from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, index=True, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # Nowa kolumna language, domyślnie "pl"
    language        = Column(String, nullable=False, default="pl")

    # Relacje do wiadomości
    messages_sent     = relationship(
        "Message",
        back_populates="sender",
        foreign_keys="Message.sender_id"
    )
    messages_received = relationship(
        "Message",
        back_populates="receiver",
        foreign_keys="Message.receiver_id"
    )

class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    encrypted   = Column(String, nullable=False)    # JSON-stringowana lista intów
    plain       = Column(Text, nullable=False)      # Jawny tekst od klienta
    timestamp   = Column(DateTime, default=datetime.utcnow)

    sender   = relationship(
        "User",
        back_populates="messages_sent",
        foreign_keys=[sender_id]
    )
    receiver = relationship(
        "User",
        back_populates="messages_received",
        foreign_keys=[receiver_id]
    )