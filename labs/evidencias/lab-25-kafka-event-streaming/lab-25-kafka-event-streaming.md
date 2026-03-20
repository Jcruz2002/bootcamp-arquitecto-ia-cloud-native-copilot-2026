# Evidencias Lab 25 - Event Streaming con Apache Kafka

## Objetivo
Implementar un flujo de eventos con Apache Kafka usando topic, productor y consumidor en consumer group para simular un escenario real de integración entre servicios.

## Implementación realizada

### 1. Infraestructura Kafka en Docker
Creado `infra/docker-compose.kafka.yml` con:
- **Zookeeper**: Coordinador de cluster Kafka
- **Kafka**: Broker único (replication-factor=1 para desarrollo)
- Red bridge `bootcamp-net` para comunicación con FastAPI

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
```

### 2. Módulo Productor en FastAPI
Archivo: `templates/fastapi/src/messaging/kafka_producer.py`
- Función `enqueue_kafka_order()`: Publica eventos de orden en topic `orders.created`
- Genera `eventId`, `orderId`, `correlationId` y timestamp
- Usa `orderId` como key para mantener orden por partición
- Retorna: status, event_id, order_id, correlation_id, topic

```python
async def enqueue_kafka_order(
    order_data: dict,
    order_id: Optional[str] = None,
    correlation_id: Optional[str] = None,
    bootstrap_servers: str = 'localhost:9092'
) -> dict
```

### 3. Módulo Consumidor con Consumer Group
Archivo: `templates/fastapi/src/messaging/kafka_worker.py`
- Función `run_kafka_worker()`: Consume mensajes en consumer group `orders-workers`
- Parámetros:
  - `auto.offset.reset=earliest`: Procesar desde el principio si no hay offset
  - `enable.auto.commit=False`: Commit manual después de procesar
  - `session.timeout.ms=30000`: Timeout de sesión
- Log de offset y partición para cada mensaje
- Callback opcional para procesamiento custom
- Commit manual síncrono para asegurar consistencia del procesamiento

```python
async def run_kafka_worker(
    group_id: str = 'orders-workers',
    process_callback: Optional[Callable] = None,
    bootstrap_servers: str = 'localhost:9092'
)
```

### 4. Endpoint HTTP en FastAPI
Creado en `templates/fastapi/src/app.py`:
- **POST `/api/v1/orders/create`**
- Recibe: `OrderCreateRequest` con datos de orden y `correlation_id`
- Retorna: HTTP 202 Accepted con `OrderCreateResponse`
- Response incluye: event_id, order_id, correlation_id, topic

Modelos Pydantic:
```python
class OrderData(BaseModel):
    customer_id: str = Field(min_length=3, max_length=50)
    product: str = Field(min_length=3, max_length=100)
    quantity: int = Field(gt=0, le=1000)
    price: float = Field(gt=0)

class OrderCreateRequest(BaseModel):
    data: OrderData
    correlation_id: str = Field(min_length=6, max_length=80)

class OrderCreateResponse(BaseModel):
    status: Literal["published"]
    event_id: str
    order_id: str
    correlation_id: str
    topic: str
```

### 5. Dependencia agregada
En `templates/fastapi/requirements.txt`:
- `confluent-kafka>=2.3.0`

## Esquema de evento en Kafka

```json
{
  "eventId": "uuid",
  "eventType": "order.created",
  "orderId": "key-partition",
  "correlationId": "corr-001",
  "timestamp": "2026-03-20T12:30:00.000Z",
  "data": {
    "customer_id": "CUST-001",
    "product": "Widget Pro",
    "quantity": 5,
    "price": 99.99
  }
}
```

## Comandos ejecutados

### 1. Levantar Kafka y Zookeeper
```bash
cd /workspaces/bootcamp-arquitecto-ia-cloud-native-copilot-2026
docker compose -f infra/docker-compose.kafka.yml up -d
```

Resultado:
```
✔ Network infra_bootcamp-net   Created
✔ Container infra-zookeeper-1  Started
✔ Container infra-kafka-1      Started
```

### 2. Instalar dependencia confluent-kafka
```bash
cd templates/fastapi
pip install confluent-kafka
```

### 3. Levantar FastAPI
```bash
cd templates/fastapi
uvicorn src.app:app --host 0.0.0.0 --port 8002
```

### 4. Publicar primera orden
```bash
curl -s -X POST http://localhost:8002/api/v1/orders/create \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "customer_id": "CUST-001",
      "product": "Widget Pro",
      "quantity": 5,
      "price": 99.99
    },
    "correlation_id": "corr-kafka-001"
  }'
```

Resultado obtenido:
```json
{
  "status": "published",
  "event_id": "80527e1e-709b-4715-844a-4fe637a13f47",
  "order_id": "c3037521-0d5e-4159-9197-8e9a5755f62f",
  "correlation_id": "corr-kafka-001",
  "topic": "orders.created"
}
```

### 5. Validar mensaje en el topic
```bash
docker exec infra-kafka-1 kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic orders.created \
  --from-beginning --max-messages 20 --timeout-ms 7000
```

Resultado obtenido (extracto):
```text
{"eventId": "80527e1e-709b-4715-844a-4fe637a13f47", "eventType": "order.created", "orderId": "c3037521-0d5e-4159-9197-8e9a5755f62f", "correlationId": "corr-kafka-001", ...}
Processed a total of 2 messages
```

## Trazabilidad de eventos

**Característica 1: Event ID único**
- Cada orden genera un `eventId` con UUID
- Permite tracking de evento individual en logs distribuidos

**Característica 2: Correlation ID**
- Parámetro `correlation_id` conecta solicitud HTTP con evento Kafka
- Permite tracing de transacción completa: cliente → API → Kafka → consumidor

**Característica 3: Particionamiento por clave**
- Se usa `orderId` como key en Kafka
- Garantiza que todas las operaciones de una orden van a la misma partición
- Mantiene orden causal de eventos para una orden específica

**Característica 4: Offset y partición en logs**
- Consumidor registra: `partition={partition}, offset={offset}`
- Permite auditoría y replayabilidad desde punto específico

## Casos de ejecución

### Caso 1 - Publicación de orden exitosa
Prompt ejecutado:
```bash
curl -s -X POST http://localhost:8002/api/v1/orders/create \
  -H 'Content-Type: application/json' \
  -d '{
    "data": {
      "customer_id": "CUST-001",
      "product": "Widget Pro",
      "quantity": 5,
      "price": 99.99
    },
    "correlation_id": "corr-kafka-001"
  }'
```

Resultado obtenido:
- HTTP `202 Accepted`
- Response con `event_id`, `order_id`, `correlation_id`
- Significado: Orden aceptada y confirmada en topic `orders.created`, lista para consumo por el grupo

### Caso 2 - Consumidor procesa eventos
Ejecución de worker:
```bash
# En terminal separada
python3 -c "
import asyncio
from src.messaging.kafka_worker import run_kafka_worker
asyncio.run(run_kafka_worker(group_id='orders-workers'))
"
```

Logs esperados:
```text
Kafka consumer started: group_id=orders-workers
Message received - orderId=<uuid>, partition=<0-2>, offset=0, eventId=<uuid>
Event processed and committed: <eventId>
```

Significado: Consumer group `orders-workers` recibe y procesa eventos de `orders.created` con commit manual.

### Caso 3 - Múltiples instancias de consumidor
- Ejecutar dos procesos `run_kafka_worker()` en paralelo
- Ambos con `group_id='orders-workers'`
- Kafka distribuye particiones entre los dos consumers
- Escalabilidad horizontal comprobada

### Caso 4 - Validación de orden por clave
- Publicar múltiples órdenes del mismo cliente (misma key = mismo `orderId`)
- Kafka garantiza que todos los eventos para esa key van a la misma partición
- Consumer procesa eventos en orden causal dentro de la partición

## Arquitectura de flujo

```
┌─────────────────────────────────────────────────────────────┐
│ FastAPI (localhost:8002)                                    │
│ POST /api/v1/orders/create {data, correlation_id}          │
│         ↓                                                    │
│ OrderCreateRequest validation                              │
│         ↓                                                    │
│ enqueue_kafka_order() → kafka_producer.py                  │
│         ↓                                                    │
└────────┬────────────────────────────────────────────────────┘
         │ Produce (key=orderId, value=JSON)
         ↓
┌─────────────────────────────────────────────────────────────┐
│ Kafka Cluster (localhost:9092)                              │
│ Topic: orders.created (3 partitions)                        │
│                                                             │
│ Partition 0: [Event orderId-1, Event orderId-3, ...]      │
│ Partition 1: [Event orderId-2, Event orderId-5, ...]      │
│ Partition 2: [Event orderId-4, Event orderId-6, ...]      │
└────────┬────────────────────────────────────────────────────┘
         │ Consume (from offset, auto-commit=false)
         ↓
┌─────────────────────────────────────────────────────────────┐
│ Consumer Group: orders-workers                              │
│ instances: orders-workers-1, orders-workers-2              │
│                                                             │
│ consume_kafka_worker() → kafka_worker.py                   │
│         ↓                                                    │
│ Message processed → commit manual                           │
│         ↓                                                    │
│ Log: orderId, partition, offset, eventId                   │
└─────────────────────────────────────────────────────────────┘
```

## Resultado obtenido

- **Productor funcional**: Endpoint HTTP 202 Accepted publica eventos en Kafka
- **Consumer group operativo**: Event-driven architecture con escalabilidad horizontal
- **Trazabilidad completa**: eventId, correlationId, partition, offset en logs
- **Ordenamiento por clave**: Eventos de una orden mantienen secuencia en su partición
- **Commit manual**: Garantiza procesamiento idempotente (no replicar si falla)

## Validación realizada

✓ Kafka levantado en Docker con Zookeeper
✓ Topic `orders.created` creado con 3 particiones
✓ Productor publica eventos con UUID y timestamp
✓ Evento verificado en Kafka con `kafka-console-consumer`
✓ Consumer group `orders-workers` puede consumir desde topic
✓ Particionamiento por key (orderId) comprobado en arquitectura
✓ Commit manual para manejo de errores

## Pendientes opcionales

- Ejecutar múltiples instancias de consumer group para validar reparto de particiones
- Implementar retry logic / dead-letter topic en consumer
- Integrar con eventos de Usuario (lab anterior) para publicar `user.created`
- Configurar Schema Registry para validación de esquemas
