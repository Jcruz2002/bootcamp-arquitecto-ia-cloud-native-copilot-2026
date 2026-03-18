# Lab 16 - Observabilidad con Prometheus y Grafana

## Objetivo
Obtener visibilidad operativa de la API mediante métricas de tiempo real y un dashboard base útil para operación.

## Implementación realizada

### 1) Instrumentación de backend (.NET)
Se integró Prometheus en la API para exponer métricas HTTP.

Archivos modificados:
- `templates/dotnet10-api/src/Api.csproj`
- `templates/dotnet10-api/src/Program.cs`

Cambios principales:
- Paquete agregado: `prometheus-net.AspNetCore`.
- Middleware de métricas: `app.UseHttpMetrics();`
- Endpoint de scraping: `app.MapMetrics("/metrics");`

### 2) Stack de observabilidad local
Se creó stack Docker Compose para Prometheus + Grafana con aprovisionamiento automático.

Archivos agregados:
- `observabilidad/prometheus-grafana/docker-compose.yml`
- `observabilidad/prometheus-grafana/prometheus.yml`
- `observabilidad/prometheus-grafana/provisioning/datasources/prometheus.yml`
- `observabilidad/prometheus-grafana/provisioning/dashboards/dashboards.yml`
- `observabilidad/prometheus-grafana/provisioning/dashboards/json/bootcamp-api-overview.json`

Configuración clave:
- Prometheus `9090`, Grafana `3001`.
- Target de scraping:
  - job: `api-dotnet`
  - url: `http://host.docker.internal:8080/metrics`
- Dashboard provisionado automáticamente: `Bootcamp API Overview`.

### 3) Dashboard base en Grafana
Se provisionó dashboard con paneles de operación inicial:
- Disponibilidad API (`up`).
- Requests por segundo (`rate(http_requests_received_total[1m])`).
- Tasa por código HTTP.

## Validación ejecutada

### Levantamiento de servicios
Comandos ejecutados:

```bash
cd infra
docker compose -f docker-compose.data.yml up -d postgres

cd templates/dotnet10-api/src
dotnet run --urls http://0.0.0.0:8080

cd observabilidad/prometheus-grafana
docker compose up -d
```

Estado observado:
- API `/health`: `200`
- API `/metrics`: `200`
- Prometheus `/-/healthy`: `200`
- Grafana `/api/health`: `200`

### Generación de carga
Comandos ejecutados:

```bash
for i in $(seq 1 60); do curl -s -o /dev/null 'http://localhost:8080/health'; done
for i in $(seq 1 20); do curl -s -o /dev/null 'http://localhost:8080/'; done
```

### Verificación en Prometheus
Consultas ejecutadas:

```bash
curl -s 'http://localhost:9090/api/v1/query?query=up{job="api-dotnet"}'
curl -s 'http://localhost:9090/api/v1/query?query=http_requests_received_total{job="api-dotnet"}'
curl -s 'http://localhost:9090/api/v1/query?query=increase(http_requests_received_total{job="api-dotnet"}[15m])'
```

Resultados relevantes observados:
- Target `api-dotnet` con `health="up"` y `lastError=""`.
- Serie con tráfico real, por ejemplo:
  - `http_requests_received_total{endpoint="/health",code="200"} = 141`
- Incremento en 15 min:
  - `increase(http_requests_received_total{endpoint="/health"}[15m]) = 143.2843...`

### Verificación en Grafana
Consulta ejecutada:

```bash
curl -s -u admin:admin 'http://localhost:3001/api/search?query=Bootcamp%20API'
```

Resultado observado:
- Dashboard provisionado encontrado:
  - `uid: bootcamp-api-overview`
  - `title: Bootcamp API Overview`

## Resultado del laboratorio
- Instrumentación backend: **OK**
- Scraping Prometheus activo: **OK**
- Dashboard base con datos reales: **OK**
- Validación end-to-end (API -> Prometheus -> Grafana): **OK**

## Accesos
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (`admin` / `admin`)
- API metrics: `http://localhost:8080/metrics`

## Archivos relevantes
- `templates/dotnet10-api/src/Api.csproj`
- `templates/dotnet10-api/src/Program.cs`
- `observabilidad/prometheus-grafana/docker-compose.yml`
- `observabilidad/prometheus-grafana/prometheus.yml`
- `observabilidad/prometheus-grafana/provisioning/datasources/prometheus.yml`
- `observabilidad/prometheus-grafana/provisioning/dashboards/dashboards.yml`
- `observabilidad/prometheus-grafana/provisioning/dashboards/json/bootcamp-api-overview.json`
