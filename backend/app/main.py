# main.py

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, crud, auth, database

# Próba zaimportowania klienta Google Translate; jeśli nie ma pakietu lub poświadczeń, ustawiamy translate na None
try:
    from google.cloud import translate_v2 as translate
except ImportError:
    translate = None

# Tworzymy tabele w nowej bazie (jeśli jeszcze nie istnieją)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="ChatApp + Transmultipleksacja (PostgreSQL)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------
# 1) REJESTRACJA
# --------------------------------------
@app.post(
    "/auth/register",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db)
):
    if crud.get_user_by_username(db, user.username):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username zajęty")
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email zajęty")
    return crud.create_user(db, user)


# --------------------------------------
# 2) LOGOWANIE
# --------------------------------------
@app.post("/auth/login", response_model=schemas.Token)
def login(
    data: schemas.UserLogin,
    db: Session = Depends(database.get_db)
):
    user = auth.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            detail="Błędne dane logowania",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth.create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


# --------------------------------------
# 3) MÓJ PROFIL (STATYCZNY) – musi być przed /users/{user_id}
# --------------------------------------
@app.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user)
):
    print("=== Nagłówki w /users/me ===")
    for name, value in request.headers.items():
        print(f"{name}: {value}")
    print("=============================")
    return current_user


# --------------------------------------
# 4) LISTA WSZYSTKICH UŻYTKOWNIKÓW (OTWARTY ENDPOINT)
# --------------------------------------
@app.get("/users", response_model=list[schemas.UserResponse])
def list_users(db: Session = Depends(database.get_db)):
    return crud.get_users(db)


# --------------------------------------
# 5) WYŚLIJ WIADOMOŚĆ (chronione JWT)
# --------------------------------------
@app.post("/messages", response_model=schemas.MessageResponse)
def send_message(
    msg: schemas.MessageCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.create_message(db, msg, current_user.id)


# --------------------------------------
# 6) POBIERZ KONWERSACJĘ (chronione JWT)
# --------------------------------------
@app.get("/messages/{other_id}", response_model=List[schemas.MessageResponse])
def get_conversation(
    other_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    """
    Zwraca listę MessageResponse:
      - id
      - sender_id
      - receiver_id
      - encrypted
      - plain
      - translated  (opcjonalnie, jeśli tłumaczenie się powiodło)
      - timestamp
    """
    # 1) Pobranie rozmowy z bazy
    convo = crud.get_conversation(db, current_user.id, other_id)

    # 2) Spróbuj utworzyć klienta Google Translate, jeśli pakiet jest dostępny
    translator = None
    if translate is not None:
        try:
            translator = translate.Client()
        except Exception:
            translator = None

    target_lang = current_user.language  # np. "en", "pl", "de", itp.

    result_list = []
    for msg in convo:
        translated_text = None

        # Jeśli mamy klienta translate i jawny tekst, spróbuj przetłumaczyć
        if translator and msg.plain:
            try:
                res = translator.translate(msg.plain, target_language=target_lang)
                translated_text = res.get("translatedText", msg.plain)
            except Exception:
                # W razie błędu tłumaczenia zostaw None → frontend wyświetli plain
                translated_text = None

        result_list.append(
            schemas.MessageResponse(
                id=msg.id,
                sender_id=msg.sender_id,
                receiver_id=msg.receiver_id,
                encrypted=msg.encrypted,
                plain=msg.plain,
                translated=translated_text,
                timestamp=msg.timestamp,
            )
        )

    return result_list