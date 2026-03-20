import json
import time
import uuid
from datetime import datetime
from typing import Optional
from confluent_kafka import Producer
import logging

logger = logging.getLogger(__name__)


def delivery_report(err, msg):
    """Callback de entrega de mensajes"""
    if err is not None:
        logger.error(f'Message delivery failed: {err}')
    else:
        logger.info(f'Message delivered to {msg.topic()} [{msg.partition()}]')

def build_kafka_producer(bootstrap_servers: str = 'localhost:9092') -> Producer:
    """Construir cliente productor de Kafka"""
    config = {
        'bootstrap.servers': bootstrap_servers,
        'client.id': 'fastapi-producer',
        'acks': 'all'
    }
    return Producer(config)


def _produce_with_confirmation(
    producer: Producer,
    topic: str,
    key: bytes,
    value: bytes,
    timeout_seconds: float = 10.0,
) -> None:
    """Publica un mensaje y espera confirmacion de entrega dentro de un timeout."""
    delivery_state: dict[str, str | None] = {"error": None}

    def on_delivery(err, _msg):
        if err is not None:
            delivery_state["error"] = str(err)

    producer.produce(topic=topic, key=key, value=value, callback=on_delivery)
    deadline = time.time() + timeout_seconds

    while len(producer) > 0 and time.time() < deadline:
        producer.poll(0.1)

    remaining = producer.flush(0)
    if delivery_state["error"] is not None:
        raise RuntimeError(f"Kafka delivery failed: {delivery_state['error']}")
    if remaining > 0:
        raise RuntimeError("Kafka delivery timed out")

async def enqueue_kafka_order(
    order_data: dict,
    order_id: Optional[str] = None,
    correlation_id: Optional[str] = None,
    bootstrap_servers: str = 'localhost:9092'
) -> dict:
    """Publicar orden en Kafka"""
    try:
        producer = build_kafka_producer(bootstrap_servers)
        
        event_id = str(uuid.uuid4())
        order_id = order_id or str(uuid.uuid4())
        correlation_id = correlation_id or str(uuid.uuid4())
        
        event = {
            'eventId': event_id,
            'eventType': 'order.created',
            'orderId': order_id,
            'correlationId': correlation_id,
            'timestamp': datetime.utcnow().isoformat(),
            'data': order_data
        }
        
        message_json = json.dumps(event)
        
        # Usar order_id como key para mantener ordenamiento por clave.
        _produce_with_confirmation(
            producer=producer,
            topic='orders.created',
            key=order_id.encode('utf-8'),
            value=message_json.encode('utf-8'),
            timeout_seconds=10.0,
        )
        
        logger.info(f'Order event published: {event_id} -> partition')
        
        return {
            'status': 'published',
            'event_id': event_id,
            'order_id': order_id,
            'correlation_id': correlation_id,
            'topic': 'orders.created'
        }
    except Exception as e:
        logger.error(f'Error publishing to Kafka: {e}')
        raise
