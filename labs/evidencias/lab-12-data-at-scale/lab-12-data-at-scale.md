# Lab 12 - Data at Scale y optimizacion

## Objetivo
Evaluar y mejorar rendimiento con volumen de datos realista para consultas clave de usuarios.

## Entorno evaluado
- Motor: PostgreSQL (`bootcamp_api`).
- API: .NET 10 (`templates/dotnet10-api`).
- Cache: Redis (`infra-redis-1`).

## Dataset cargado

Se cargaron 200,000 registros adicionales en `Users` (total final: 200,002):

```sql
INSERT INTO "Users" ("Id", "Name", "Email", "Status", "CreatedAt", "UpdatedAt")
SELECT
  gen_random_uuid(),
  'User ' || gs,
  'user' || gs || '@mail.test',
  CASE WHEN random() < 0.85 THEN 'active' ELSE 'inactive' END,
  NOW() - ((random()*365)::int || ' days')::interval,
  NOW()
FROM generate_series(1, 200000) gs
ON CONFLICT ("Email") DO NOTHING;
```

Distribucion final observada:
- `total_users`: 200,002
- `active_users`: 170,168

## Consultas clave medidas

### Query A
Listado general reciente:

```sql
SELECT "Id","Name","Email","Status","CreatedAt"
FROM "Users"
ORDER BY "CreatedAt" DESC
LIMIT 20;
```

### Query B
Listado activo reciente:

```sql
SELECT "Id","Name","Email","Status","CreatedAt"
FROM "Users"
WHERE "Status"='active'
ORDER BY "CreatedAt" DESC
LIMIT 20;
```

## Baseline (antes de nuevos indices)

Resultados de `EXPLAIN (ANALYZE, BUFFERS)`:

- Query A: `Execution Time: 130.929 ms`
- Query B: `Execution Time: 119.335 ms`

Plan observado:
- Query A: `Seq Scan` + `Sort` (top-N heapsort)
- Query B: filtro por status con mucho volumen y costo alto de ordenacion

## Mejoras aplicadas

### 1) Indices SQL

```sql
CREATE INDEX IF NOT EXISTS "IX_Users_CreatedAt"
ON "Users" ("CreatedAt" DESC);

CREATE INDEX IF NOT EXISTS "IX_Users_Status_CreatedAt"
ON "Users" ("Status", "CreatedAt" DESC);

ANALYZE "Users";
```

### 2) Modelo EF actualizado para sostenibilidad

Archivo:
- `templates/dotnet10-api/src/Infrastructure/AppDb.cs`

Agregado en `OnModelCreating`:
- indice `CreatedAt`
- indice compuesto `{ Status, CreatedAt }`

### 3) Cache de lectura frecuente (Redis)

Cambios en API:
- `templates/dotnet10-api/src/Api.csproj` (StackExchangeRedis package)
- `templates/dotnet10-api/src/Program.cs` (configuracion cache Redis + fallback memory)
- `templates/dotnet10-api/src/Application/UserService.cs` (cache para `skip=0` con TTL 30s + invalidacion en create/update/delete)
- `templates/dotnet10-api/src/appsettings.json` (`Redis:ConnectionString`)

Redis levantado con:

```bash
docker compose -f infra/docker-compose.data.yml up -d redis
```

## Resultados (despues)

### SQL (indices)

`EXPLAIN ANALYZE` despues de indices:

- Query A: `Execution Time: 0.700 ms`
- Query B: `Execution Time: 1.510 ms`

Mejora aproximada:
- Query A: de 130.929 ms a 0.700 ms (~99.47% menos)
- Query B: de 119.335 ms a 1.510 ms (~98.73% menos)

### API (cache Redis)

Endpoint probado:
- `GET /api/v1/users?skip=0&take=20` (ruta cacheada)

Muestras:
- cold (primera llamada): `3.744441 s`
- warm average (30 llamadas): `0.011319 s`
- warm p95 aprox: `0.033587 s`

Comparativa control sin cache (skip=1, 30 llamadas):
- `nocache_avg=0.019575 s`

Mejora media warm vs no-cache:
- de ~19.6 ms a ~11.3 ms (reduccion ~42%)

## Trade-offs documentados

1. Indices
- Pro: latencia de lectura cae fuertemente en consultas de listado reciente.
- Contra: costo adicional en escrituras (`INSERT/UPDATE`) y almacenamiento.

2. Cache Redis
- Pro: reduce latencia promedio en lecturas repetidas de primera pagina.
- Contra: riesgo de datos ligeramente desactualizados durante el TTL (30s).

3. Invalidacion
- Pro: se invalida cache en create/update/delete para reducir staleness.
- Contra: invalidacion parcial (claves comunes) no cubre combinaciones arbitrarias de paginacion.

## Validacion del lab

- Existe comparativa antes/despues: **SI**
- Se observan mejoras medibles: **SI**

## Entregables

- Evidencia: `labs/evidencias/lab-12-data-at-scale/lab-12-data-at-scale.md`
- Registro actualizado en `EVIDENCIAS.md`
