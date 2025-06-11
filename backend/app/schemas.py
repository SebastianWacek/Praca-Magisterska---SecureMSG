# schemas.py

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# ==== User ====

class UserBase(BaseModel):
    username: str
    email: EmailStr
    # Pole language nie jest wymagane, domyślnie "pl"
    language: Optional[str] = "pl"

class UserCreate(UserBase):
    password: str
    # Teraz przy rejestracji nie musisz podawać "language" (Pydantic wstawi "pl")

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True


# ==== Token ====

class Token(BaseModel):
    access_token: str
    token_type: str


# ==== Message ====

class MessageBase(BaseModel):
    receiver_id: int  # ID odbiorcy
    encrypted: str    # JSON-stringowana lista intów (zaszyfrowany ciąg)
    plain: str        # Jawny tekst (używany przy tłumaczeniu)

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime
    # to pole wypełni backend, jeśli wykona tłumaczenie
    translated: Optional[str] = None

    class Config:
        orm_mode = True