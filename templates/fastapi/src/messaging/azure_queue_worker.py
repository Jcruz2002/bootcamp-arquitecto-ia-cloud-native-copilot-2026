from __future__ import annotations

import argparse
import asyncio
import base64
import json
import logging
import os
from typing import Any

from azure.storage.queue.aio import QueueClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_QUEUE_NAME = os.getenv("AZURE_QUEUE_NAME", "jobs-email")


def _decode_message_text(message_text: str) -> dict[str, Any]:
    raw = base64.b64decode(message_text).decode("utf-8")
    return json.loads(raw)


async def run_worker(batch_size: int) -> None:
    if not AZURE_STORAGE_CONNECTION_STRING.strip():
        raise RuntimeError("AZURE_STORAGE_CONNECTION_STRING no configurada.")

    queue_client = QueueClient.from_connection_string(
        AZURE_STORAGE_CONNECTION_STRING,
        AZURE_QUEUE_NAME,
    )

    async with queue_client:
        await queue_client.create_queue()
        logging.info("azure_worker_started queue=%s", AZURE_QUEUE_NAME)

        while True:
            messages = await queue_client.receive_messages(messages_per_page=batch_size, visibility_timeout=20)
            async for page in messages.by_page():
                page_items = [item async for item in page]
                if not page_items:
                    await asyncio.sleep(2)
                    continue

                for message in page_items:
                    payload = _decode_message_text(message.content)
                    job_id = payload.get("jobId", "")
                    correlation_id = payload.get("correlationId", "")

                    try:
                        logging.info("azure_processed jobId=%s correlationId=%s", job_id, correlation_id)
                        await queue_client.delete_message(message)
                    except Exception as ex:  # pragma: no cover
                        logging.warning(
                            "azure_retry jobId=%s correlationId=%s reason=%s",
                            job_id,
                            correlation_id,
                            ex,
                        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Azure Queue worker for Lab 24")
    parser.add_argument("--batch", type=int, default=10)
    args = parser.parse_args()
    asyncio.run(run_worker(args.batch))


if __name__ == "__main__":
    main()
