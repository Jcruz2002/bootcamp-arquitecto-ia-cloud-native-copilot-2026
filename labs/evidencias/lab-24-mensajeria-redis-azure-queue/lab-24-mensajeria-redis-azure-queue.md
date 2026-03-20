# Evidencias Lab 24 - Mensajeria asincrona con Redis y Azure Queue Storage

## Objetivo
Implementar flujo productor/consumidor con dos enfoques:
1. Redis Streams (local, rapido).
2. Azure Queue Storage (cloud-native desacoplado).

## Implementacion realizada

### API Productor (FastAPI)
- Archivo: `templates/fastapi/src/app.py`
- Endpoint nuevo: `POST /api/v1/jobs/email`
- Respuesta no bloqueante: `202 Accepted`
- Campos de trazabilidad: `job_id` y `correlation_id`
- Backends soportados:
  - `redis`
  - `azure_queue`

### Redis Streams
- Productor Redis: `templates/fastapi/src/messaging/redis_streams.py`
- Worker Redis: `templates/fastapi/src/messaging/redis_worker.py`
- Caracteristicas:
  - Consumer group (`workers`)
  - `XACK` despues de procesar
  - Reintento controlado (`fail_once`)
  - Idempotencia basica con Redis Set (`jobs:processed`)

### Azure Queue
- Productor Azure Queue: `templates/fastapi/src/messaging/azure_queue.py`
- Worker Azure Queue: `templates/fastapi/src/messaging/azure_queue_worker.py`
- Comportamiento:
  - Encola mensajes en base64
  - Consumidor borra mensaje al exito
  - Si falla, mensaje queda para reintento por visibilidad

## Comandos ejecutados

### 1) Dependencias e infraestructura
```bash
cd templates/fastapi
pip3 install -r requirements.txt

cd /workspaces/bootcamp-arquitecto-ia-cloud-native-copilot-2026
docker compose -f infra/docker-compose.data.yml up -d redis postgres
```

### 2) Levantar API y worker Redis
```bash
cd templates/fastapi
uvicorn src.app:app --host 0.0.0.0 --port 8002

cd templates/fastapi
python3 -m src.messaging.redis_worker --consumer worker-1 --count 10
```

### 3) Publicar jobs (producer)
```bash
curl -s -X POST http://localhost:8002/api/v1/jobs/email \
  -H 'Content-Type: application/json' \
  -d '{"backend":"redis","type":"send_welcome_email","correlation_id":"corr-l24-001","payload":{"user_id":101,"template":"welcome","fail_once":false}}'

curl -s -X POST http://localhost:8002/api/v1/jobs/email \
  -H 'Content-Type: application/json' \
  -d '{"backend":"redis","type":"send_welcome_email","correlation_id":"corr-l24-002","payload":{"user_id":202,"template":"welcome","fail_once":true}}'
```

Resultados obtenidos:
- Job 1: `status=accepted`, `backend=redis`, `job_id=120f8b2c-e7cf-4f1a-aa0e-df31d7d8e8d7`, `correlation_id=corr-l24-001`
- Job 2: `status=accepted`, `backend=redis`, `job_id=0a1759f6-2dde-4055-a216-84b78f34cc19`, `correlation_id=corr-l24-002`

### 4) Prueba de validacion Azure Queue sin credenciales
```bash
curl -s -X POST http://localhost:8002/api/v1/jobs/email \
  -H 'Content-Type: application/json' \
  -d '{"backend":"azure_queue","type":"send_welcome_email","correlation_id":"corr-l24-az-001","payload":{"user_id":404,"template":"welcome","fail_once":false}}'
```

Resultado obtenido:
- HTTP `400`
- `{"detail":"AZURE_STORAGE_CONNECTION_STRING no configurada."}`

## Checklist de pruebas para evidenciar (demo)

### 1) Disponibilidad de API
Comando:
```bash
curl -i http://localhost:8002/health
```
Esperado:
- HTTP `200`.
- Body con `{"status":"ok"}`.

### 2) Swagger FastAPI
URL:
- `http://localhost:8002/docs`
Esperado:
- Swagger cargando con endpoint `POST /api/v1/jobs/email` visible.

### 3) Productor Redis (flujo normal)
Comando:
```bash
curl -i -X POST http://localhost:8002/api/v1/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"backend":"redis","type":"send_welcome_email","correlation_id":"corr-l24-demo-001","payload":{"user_id":101,"template":"welcome","fail_once":false}}'
```
Esperado:
- HTTP `202 Accepted`.
- JSON con: `status=accepted`, `job_id`, `correlation_id`, `queue_message_id`.

### 4) Reintento basico (`fail_once=true`)
Comando:
```bash
curl -i -X POST http://localhost:8002/api/v1/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"backend":"redis","type":"send_welcome_email","correlation_id":"corr-l24-demo-002","payload":{"user_id":202,"template":"welcome","fail_once":true}}'
```
Esperado:
- Producer devuelve HTTP `202`.
- Worker muestra primero `requeued ... simulated_failure attempt=1` y luego `processed ... attempts=1`.

### 5) Azure Queue sin credenciales (validacion de configuracion)
Comando:
```bash
curl -i -X POST http://localhost:8002/api/v1/jobs/email \
  -H "Content-Type: application/json" \
  -d '{"backend":"azure_queue","type":"send_welcome_email","correlation_id":"corr-l24-az-001","payload":{"user_id":404,"template":"welcome","fail_once":false}}'
```
Esperado:
- HTTP `400`.
- Body con `AZURE_STORAGE_CONNECTION_STRING no configurada`.

### 6) Que capturar para evidencia
- Captura de `http://localhost:8002/docs`.
- Salida de `curl` con `202 Accepted` y `job_id`/`correlation_id`.
- Logs del worker con `processed`, `requeued` e `idempotent_skip`.
- Salida del caso Azure con `400` controlado.

## Logs productor/consumidor

### Worker Redis
```text
processed jobId=120f8b2c-e7cf-4f1a-aa0e-df31d7d8e8d7 correlationId=corr-l24-001 payload={...}
requeued jobId=0a1759f6-2dde-4055-a216-84b78f34cc19 correlationId=corr-l24-002 reason=simulated_failure attempt=1
processed jobId=0a1759f6-2dde-4055-a216-84b78f34cc19 correlationId=corr-l24-002 payload={..., 'attempts': 1}
processed jobId=dup-l24-001 correlationId=corr-l24-dup-1 payload={...}
idempotent_skip jobId=dup-l24-001 correlationId=corr-l24-dup-2
```

Interpretacion:
- Reintento validado: `fail_once=true` fallo una vez y se reproceso en segundo intento.
- Idempotencia validada: dos mensajes con el mismo `jobId` no se procesan dos veces.
- Trazabilidad validada: logs incluyen `jobId` y `correlationId`.

## Tabla comparativa Redis vs Azure Queue

| Criterio | Redis Streams | Azure Queue Storage |
|---|---|---|
| Tiempo de setup local | Muy rapido (docker) | Requiere cuenta Azure y storage account |
| Latencia esperada | Muy baja | Baja/Media (red cloud) |
| Operacion offline/local | Excelente | Limitada (requiere cloud) |
| Complejidad operativa | Media (grupos, ack, pending) | Baja/Media (polling, visibility timeout) |
| Casos ideales | Procesamiento interno de alta velocidad | Integracion desacoplada entre servicios cloud |

## Resultado final
- Flujo productor/consumidor funcional con Redis Streams.
- API responde con `202 Accepted` tras encolar.
- Worker procesa, reintenta y evita duplicados por idempotencia.
- Integracion Azure Queue implementada y validacion de configuracion cubierta (400 controlado sin credenciales).

## Pendiente opcional de cierre cloud
- Configurar `AZURE_STORAGE_CONNECTION_STRING` y ejecutar worker Azure para evidencia runtime en cloud.
