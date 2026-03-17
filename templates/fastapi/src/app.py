from datetime import datetime, timezone
from typing import Literal
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field


class ErrorResponse(BaseModel):
    error: str
    detail: str


class UserCreate(BaseModel):
    name: str = Field(min_length=3, max_length=100)
    email: EmailStr
    status: Literal["active", "inactive"] = "active"


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=100)
    email: EmailStr | None = None
    status: Literal["active", "inactive"] | None = None


class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    status: Literal["active", "inactive"]
    created_at: datetime
    updated_at: datetime


app = FastAPI(
    title="Bootcamp FastAPI Users Service",
    version="1.0.0",
    description="Servicio productivo basico para CRUD de usuarios.",
)

# Repositorio en memoria para el lab.
users_db: dict[UUID, UserOut] = {}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="validation_error", detail=str(exc.errors())
        ).model_dump(),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/users", response_model=list[UserOut])
def list_users(skip: int = 0, limit: int = 10) -> list[UserOut]:
    if skip < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="skip y limit deben ser validos")

    ordered = sorted(users_db.values(), key=lambda u: u.created_at, reverse=True)
    return ordered[skip : skip + limit]


@app.get(
    "/api/v1/users/{user_id}",
    response_model=UserOut,
    responses={404: {"model": ErrorResponse}},
)
def get_user(user_id: UUID) -> UserOut:
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@app.post(
    "/api/v1/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
def create_user(payload: UserCreate) -> UserOut:
    if any(u.email == payload.email for u in users_db.values()):
        raise HTTPException(status_code=409, detail="Email ya existe")

    now = datetime.now(timezone.utc)
    user = UserOut(
        id=uuid4(),
        name=payload.name,
        email=payload.email,
        status=payload.status,
        created_at=now,
        updated_at=now,
    )
    users_db[user.id] = user
    return user


@app.put(
    "/api/v1/users/{user_id}",
    response_model=UserOut,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
def update_user(user_id: UUID, payload: UserUpdate) -> UserOut:
    current = users_db.get(user_id)
    if not current:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if payload.email and any(
        u.email == payload.email and u.id != user_id for u in users_db.values()
    ):
        raise HTTPException(status_code=409, detail="Email ya existe")

    updated = current.model_copy(
        update={
            "name": payload.name if payload.name is not None else current.name,
            "email": payload.email if payload.email is not None else current.email,
            "status": payload.status if payload.status is not None else current.status,
            "updated_at": datetime.now(timezone.utc),
        }
    )
    users_db[user_id] = updated
    return updated


@app.delete(
    "/api/v1/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}},
)
def delete_user(user_id: UUID) -> None:
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    del users_db[user_id]
