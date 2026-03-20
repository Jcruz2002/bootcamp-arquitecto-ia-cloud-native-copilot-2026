from __future__ import annotations

import json
from datetime import datetime, timezone

from langchain_core.tools import tool
from sqlalchemy import func, select

from src.database import SessionLocal
from src.models import User


@tool
def get_active_users(limit: int = 100) -> str:
    """Returns active users from the real users table as JSON."""
    safe_limit = min(max(limit, 1), 1000)

    with SessionLocal() as db:
        rows = db.execute(
            select(User)
            .where(User.status == "active")
            .order_by(User.created_at.desc())
            .limit(safe_limit)
        ).scalars().all()

    payload = [
        {
            "id": str(row.id),
            "name": row.name,
            "email": row.email,
            "status": row.status,
            "created_at": row.created_at.isoformat(),
            "updated_at": row.updated_at.isoformat(),
        }
        for row in rows
    ]
    return json.dumps(payload, ensure_ascii=True)


@tool
def get_user_count() -> str:
    """Returns total and active user counts as JSON."""
    with SessionLocal() as db:
        total = db.execute(select(func.count()).select_from(User)).scalar_one()
        active = db.execute(
            select(func.count()).select_from(User).where(User.status == "active")
        ).scalar_one()

    payload = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "total": int(total),
        "active": int(active),
        "inactive": int(total) - int(active),
    }
    return json.dumps(payload, ensure_ascii=True)
