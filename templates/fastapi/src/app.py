from datetime import datetime, timezone
from typing import Literal
from uuid import UUID, uuid4

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from src.agent.graph import run_agent
from src.database import SessionLocal
from src.models import User


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


class AgentQueryRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=1000)


class AgentQueryResponse(BaseModel):
    response: str
    node_trace: list[str]
    mode: Literal["llm", "fallback"]


app = FastAPI(
    title="Bootcamp FastAPI Users Service",
    version="1.0.0",
    description="Servicio productivo basico para CRUD de usuarios.",
)


def get_session() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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


@app.post(
    "/api/v1/agent/query",
    response_model=AgentQueryResponse,
    responses={400: {"model": ErrorResponse}},
)
async def query_agent(payload: AgentQueryRequest) -> AgentQueryResponse:
    try:
        result = await run_agent(payload.prompt)
        return AgentQueryResponse(**result)
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex)) from ex


@app.get("/api/v1/users", response_model=list[UserOut])
def list_users(skip: int = 0, limit: int = 10) -> list[UserOut]:
    if skip < 0 or limit <= 0:
        raise HTTPException(status_code=400, detail="skip y limit deben ser validos")

    with SessionLocal() as db:
        rows = db.execute(
            select(User).order_by(desc(User.created_at)).offset(skip).limit(limit)
        ).scalars().all()

    return [
        UserOut(
            id=row.id,
            name=row.name,
            email=row.email,
            status=row.status,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
        for row in rows
    ]


@app.get(
    "/api/v1/users/{user_id}",
    response_model=UserOut,
    responses={404: {"model": ErrorResponse}},
)
def get_user(user_id: UUID) -> UserOut:
    with SessionLocal() as db:
        user = db.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        return UserOut(
            id=user.id,
            name=user.name,
            email=user.email,
            status=user.status,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


@app.post(
    "/api/v1/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
)
def create_user(payload: UserCreate) -> UserOut:
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        exists = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
        if exists:
            raise HTTPException(status_code=409, detail="Email ya existe")

        user = User(
            id=uuid4(),
            name=payload.name,
            email=payload.email,
            status=payload.status,
            created_at=now,
            updated_at=now,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        return UserOut(
            id=user.id,
            name=user.name,
            email=user.email,
            status=user.status,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


@app.put(
    "/api/v1/users/{user_id}",
    response_model=UserOut,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
)
def update_user(user_id: UUID, payload: UserUpdate) -> UserOut:
    with SessionLocal() as db:
        current = db.get(User, user_id)
        if not current:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        if payload.email and payload.email != current.email:
            exists = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
            if exists:
                raise HTTPException(status_code=409, detail="Email ya existe")

        current.name = payload.name if payload.name is not None else current.name
        current.email = payload.email if payload.email is not None else current.email
        current.status = payload.status if payload.status is not None else current.status
        current.updated_at = datetime.now(timezone.utc)

        db.add(current)
        db.commit()
        db.refresh(current)

        return UserOut(
            id=current.id,
            name=current.name,
            email=current.email,
            status=current.status,
            created_at=current.created_at,
            updated_at=current.updated_at,
        )


@app.delete(
    "/api/v1/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}},
)
def delete_user(user_id: UUID) -> None:
    with SessionLocal() as db:
        current = db.get(User, user_id)
        if not current:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        db.delete(current)
        db.commit()
