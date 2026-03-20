from __future__ import annotations

import base64
import json
import os
from typing import Any

from azure.storage.queue.aio import QueueClient

AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_QUEUE_NAME = os.getenv("AZURE_QUEUE_NAME", "jobs-email")


def _require_connection_string() -> str:
    if not AZURE_STORAGE_CONNECTION_STRING.strip():
        raise ValueError("AZURE_STORAGE_CONNECTION_STRING no configurada.")
    return AZURE_STORAGE_CONNECTION_STRING


async def enqueue_azure_queue_job(job: dict[str, Any]) -> str:
    connection_string = _require_connection_string()
    queue_client = QueueClient.from_connection_string(
        connection_string,
        AZURE_QUEUE_NAME,
    )

    message_json = json.dumps(job, ensure_ascii=True)
    message_b64 = base64.b64encode(message_json.encode("utf-8")).decode("utf-8")

    async with queue_client:
        await queue_client.create_queue()
        result = await queue_client.send_message(message_b64)
        return result.id
