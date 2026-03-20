from __future__ import annotations

import argparse
import asyncio
import json
import logging
import random
from datetime import datetime, timezone

from redis.asyncio import Redis

from src.messaging.redis_streams import (
    REDIS_CONSUMER_GROUP,
    REDIS_PROCESSED_SET,
    REDIS_STREAM_KEY,
    build_redis_client,
    ensure_consumer_group,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


async def process_job(redis_client: Redis, raw_data: dict[str, str], message_id: str) -> None:
    job_id = raw_data.get("jobId", "")
    correlation_id = raw_data.get("correlationId", "")

    if not job_id:
        logging.warning("skip message_id=%s reason=missing_jobId", message_id)
        return

    already_done = await redis_client.sismember(REDIS_PROCESSED_SET, job_id)
    if already_done:
        logging.info("idempotent_skip jobId=%s correlationId=%s", job_id, correlation_id)
        return

    payload_text = raw_data.get("payload", "{}")
    payload = json.loads(payload_text)
    attempts = int(payload.get("attempts", 0))

    should_fail_once = bool(payload.get("fail_once", False)) and attempts == 0
    if should_fail_once:
        payload["attempts"] = attempts + 1
        await redis_client.xadd(
            REDIS_STREAM_KEY,
            {
                "jobId": job_id,
                "correlationId": correlation_id,
                "type": raw_data.get("type", "send_welcome_email"),
                "payload": json.dumps(payload, ensure_ascii=True),
                "retryAt": datetime.now(timezone.utc).isoformat(),
            },
        )
        logging.warning(
            "requeued jobId=%s correlationId=%s reason=simulated_failure attempt=%s",
            job_id,
            correlation_id,
            attempts + 1,
        )
        return

    await asyncio.sleep(random.uniform(0.02, 0.12))
    await redis_client.sadd(REDIS_PROCESSED_SET, job_id)
    logging.info("processed jobId=%s correlationId=%s payload=%s", job_id, correlation_id, payload)


async def run_worker(consumer_name: str, poll_count: int) -> None:
    redis_client = build_redis_client()
    await ensure_consumer_group(redis_client)
    logging.info(
        "worker_started stream=%s group=%s consumer=%s",
        REDIS_STREAM_KEY,
        REDIS_CONSUMER_GROUP,
        consumer_name,
    )

    try:
        while True:
            messages = await redis_client.xreadgroup(
                groupname=REDIS_CONSUMER_GROUP,
                consumername=consumer_name,
                streams={REDIS_STREAM_KEY: ">"},
                count=poll_count,
                block=4000,
            )
            if not messages:
                continue

            for _stream_name, stream_messages in messages:
                for message_id, data in stream_messages:
                    try:
                        await process_job(redis_client, data, message_id)
                    finally:
                        await redis_client.xack(REDIS_STREAM_KEY, REDIS_CONSUMER_GROUP, message_id)
    finally:
        await redis_client.aclose()


def main() -> None:
    parser = argparse.ArgumentParser(description="Redis Streams worker for Lab 24")
    parser.add_argument("--consumer", default="worker-1")
    parser.add_argument("--count", type=int, default=10)
    args = parser.parse_args()

    asyncio.run(run_worker(args.consumer, args.count))


if __name__ == "__main__":
    main()
