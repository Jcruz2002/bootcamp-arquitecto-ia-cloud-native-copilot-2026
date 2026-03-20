from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any

from redis.asyncio import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_STREAM_KEY = os.getenv("REDIS_STREAM_KEY", "jobs:email")
REDIS_CONSUMER_GROUP = os.getenv("REDIS_CONSUMER_GROUP", "workers")
REDIS_PROCESSED_SET = os.getenv("REDIS_PROCESSED_SET", "jobs:processed")


def build_redis_client() -> Redis:
    return Redis.from_url(REDIS_URL, decode_responses=True)


async def enqueue_redis_job(job: dict[str, Any]) -> str:
    redis_client = build_redis_client()
    try:
        message_id = await redis_client.xadd(
            REDIS_STREAM_KEY,
            {
                "jobId": job["jobId"],
                "correlationId": job["correlationId"],
                "type": job["type"],
                "payload": json.dumps(job["payload"], ensure_ascii=True),
                "createdAt": datetime.now(timezone.utc).isoformat(),
            },
        )
        return str(message_id)
    finally:
        await redis_client.aclose()


async def ensure_consumer_group(redis_client: Redis) -> None:
    try:
        await redis_client.xgroup_create(
            REDIS_STREAM_KEY,
            REDIS_CONSUMER_GROUP,
            id="$",
            mkstream=True,
        )
    except Exception as ex:  # pragma: no cover
        if "BUSYGROUP" not in str(ex):
            raise
