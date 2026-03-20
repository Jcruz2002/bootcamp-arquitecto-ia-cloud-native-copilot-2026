# Lab 24 - Mensajería asíncrona con Redis y Azure Queue Storage

## Objetivo
Implementar un flujo productor/consumidor real usando dos enfoques:
1) Redis Streams para procesamiento rápido local.
2) Azure Queue Storage para procesamiento cloud-native desacoplado.

## Resultado esperado
- API publica tareas en cola sin bloquear la respuesta al usuario.
- Worker consume, procesa y registra estado.
- Manejo básico de reintentos e idempotencia.

## Prerrequisitos
- Lab 03 o 19 completado (.NET o NestJS).
- Redis disponible (docker-compose recomendado).
- Cuenta Azure con Storage Account.

## Parte A - Redis Streams

### 1. Levantar Redis local
```bash
docker run -d --name redis-lab -p 6379:6379 redis:8.0
```

### 2. Productor (ejemplo en .NET)
Instalar paquete:
```bash
dotnet add package StackExchange.Redis
```
Publicar mensaje:
```csharp
await db.StreamAddAsync("jobs:email", new NameValueEntry[]
{
    new("jobId", Guid.NewGuid().ToString()),
    new("type", "send_welcome_email"),
    new("payload", JsonSerializer.Serialize(new { userId = 101 }))
});
```

### 3. Consumidor con grupo
```csharp
await db.StreamCreateConsumerGroupAsync("jobs:email", "workers", "$", createStream: true);
var messages = await db.StreamReadGroupAsync("jobs:email", "workers", "worker-1", ">", count: 10);
```
Procesa y confirma (`XACK`) cada mensaje exitoso.

### 4. Idempotencia mínima
Guardar `jobId` procesados en Redis Set o en tabla DB para evitar reproceso.

## Parte B - Azure Queue Storage

### 5. Crear cola en Azure
```bash
az storage queue create --name jobs-email --account-name <storage-account>
```

### 6. Productor Azure Queue
Instalar SDK:
```bash
dotnet add package Azure.Storage.Queues
```
Código base:
```csharp
var client = new QueueClient(connectionString, "jobs-email");
await client.CreateIfNotExistsAsync();
await client.SendMessageAsync(Convert.ToBase64String(Encoding.UTF8.GetBytes(messageJson)));
```

### 7. Consumidor Azure Queue
- Leer lote (`ReceiveMessagesAsync`).
- Procesar cada mensaje.
- `DeleteMessageAsync` al éxito.
- Si falla, dejar visible nuevamente para reintento.

## Comandos sugeridos
```bash
git checkout -b lab-24
git commit -m "lab24: #Mensajería asíncrona con Redis y Azure Queue Storage"
git push origin lab-24
```

## Validación
- Endpoint de API responde rápido con `202 Accepted` tras encolar.
- Mensajes procesados correctamente por worker.
- Mensajes fallidos reintentados al menos una vez.
- Registro de `correlationId` y `jobId` en logs.

## R�brica
- 40% flujo productor/consumidor funcional.
- 30% reintentos e idempotencia básica.
- 30% evidencias y comparación Redis vs Azure Queue.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- Rama `lab-24`.
- EVIDENCIAS.md con:
  - comandos ejecutados,
  - logs del productor y consumidor,
  - tabla comparativa de tiempos y complejidad.
