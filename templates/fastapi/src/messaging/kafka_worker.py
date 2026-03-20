import json
import asyncio
import logging
from confluent_kafka import Consumer, KafkaError
from typing import Callable, Optional

logger = logging.getLogger(__name__)

KAFKA_PROCESSED_SET = 'kafka:processed:events'

def build_kafka_consumer(
    group_id: str,
    bootstrap_servers: str = 'localhost:9092',
    auto_offset_reset: str = 'earliest'
) -> Consumer:
    """Construir cliente consumidor de Kafka con consumer group"""
    config = {
        'bootstrap.servers': bootstrap_servers,
        'group.id': group_id,
        'auto.offset.reset': auto_offset_reset,
        'enable.auto.commit': False,  # Manual commit para idempotencia
        'session.timeout.ms': 30000,
    }
    return Consumer(config)

async def run_kafka_worker(
    group_id: str = 'orders-workers',
    process_callback: Optional[Callable] = None,
    bootstrap_servers: str = 'localhost:9092'
):
    """Consumir mensajes de Kafka en consumer group"""
    consumer = build_kafka_consumer(group_id, bootstrap_servers)
    consumer.subscribe(['orders.created'])
    
    logger.info(f'Kafka consumer started: group_id={group_id}')
    
    try:
        while True:
            msg = consumer.poll(timeout=5.0)
            
            if msg is None:
                continue
            
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    logger.info(f'Reached end of partition {msg.partition()}')
                else:
                    logger.error(f'Error: {msg.error()}')
                continue
            
            try:
                event_data = json.loads(msg.value().decode('utf-8'))
                event_id = event_data.get('eventId')
                order_id = event_data.get('orderId')
                partition = msg.partition()
                offset = msg.offset()
                
                logger.info(
                    f'Message received - '
                    f'orderId={order_id}, '
                    f'partition={partition}, '
                    f'offset={offset}, '
                    f'eventId={event_id}'
                )
                
                # Procesar el evento
                if process_callback:
                    await process_callback(event_data)
                else:
                    logger.info(f'Processing order: {order_id}')
                
                # Commit manual después de procesar exitosamente
                consumer.commit(asynchronous=False)
                logger.info(f'Event processed and committed: {event_id}')
                
            except json.JSONDecodeError as e:
                logger.error(f'Failed to decode message: {e}')
                consumer.commit(asynchronous=False)
            except Exception as e:
                logger.error(f'Error processing message: {e}')
                # No hacer commit si falla, para reintentar
                
    except KeyboardInterrupt:
        logger.info('Shutting down Kafka consumer')
    finally:
        consumer.close()
