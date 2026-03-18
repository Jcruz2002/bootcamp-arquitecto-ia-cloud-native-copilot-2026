# Lab 13 - EF Core migrations y seed

## Objetivo
Gestionar evolutivo de esquema y datos semilla en .NET usando la API del Lab 03 (`templates/dotnet10-api`).

## Resumen de lo realizado

Se completaron los 5 pasos del laboratorio:

1. Modelos base definidos (ya existentes de Lab 03).
2. Migración base existente y válida (`InitialCreate`).
3. Base de datos actualizada con migraciones EF Core.
4. Seed idempotente implementado y validado.
5. Segunda migración creada con cambio controlado (`AddLastLoginAt`).

## Cambios aplicados

### 1) Seed idempotente

Archivo actualizado:
- `templates/dotnet10-api/src/Application/Seed.cs`

Mejora:
- En vez de sembrar por condición global `!Any()`, ahora valida por email específico.
- Inserta solo si faltan:
  - `admin.seed@demo.com`
  - `user.seed@demo.com`

Resultado:
- Ejecutar la inicialización múltiples veces no genera duplicados.

### 2) Ejecución automática de migraciones + seed

Archivo actualizado:
- `templates/dotnet10-api/src/Program.cs`

Se agregó en startup:
- `db.Database.MigrateAsync()`
- `Seed.InitAsync(db)`

Esto asegura que:
- El esquema se alinea al modelo al iniciar.
- El seed se aplica de forma segura e idempotente.

### 3) Segunda migración con cambio controlado

Cambio de modelo:
- Archivo: `templates/dotnet10-api/src/Domain/User.cs`
- Nuevo campo: `LastLoginAt` (nullable)

Configuración EF:
- Archivo: `templates/dotnet10-api/src/Infrastructure/AppDb.cs`
- Mapeo explícito de `LastLoginAt` como `timestamp with time zone` nullable.

Migración generada:
- `templates/dotnet10-api/src/Migrations/20260318020858_AddLastLoginAt.cs`
- `templates/dotnet10-api/src/Migrations/20260318020858_AddLastLoginAt.Designer.cs`

Nota importante (compatibilidad con Lab 12):
- En Lab 12 ya existían índices creados manualmente en DB.
- La migración falló inicialmente por índices existentes.
- Se ajustó la migración para ser resiliente:
  - `CREATE INDEX IF NOT EXISTS ...`
  - `DROP INDEX IF EXISTS ...`

## Comandos ejecutados

```bash
cd templates/dotnet10-api/src

# generar segunda migración
dotnet ef migrations add AddLastLoginAt

# aplicar migraciones
dotnet ef database update
```

## Validación

### Historial de migraciones consistente

Consulta ejecutada:

```sql
SELECT "MigrationId"
FROM "__EFMigrationsHistory"
ORDER BY "MigrationId";
```

Resultado:

- `20260317040523_InitialCreate`
- `20260318020858_AddLastLoginAt`

### Cambio de esquema aplicado

Resultado esperado del laboratorio:
- Columna LastLoginAt creada en Users.

Consulta ejecutada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name='Users' AND column_name='LastLoginAt';
```

Resultado:
- `LastLoginAt | timestamp with time zone | YES`
- Confirmación: la columna `LastLoginAt` existe en la tabla `Users` y admite valores nulos.

### Seed idempotente sin duplicados

Consulta ejecutada:

```sql
SELECT "Email", COUNT(*)
FROM "Users"
WHERE "Email" IN ('admin.seed@demo.com', 'user.seed@demo.com')
GROUP BY "Email"
ORDER BY "Email";
```

Resultado:
- `admin.seed@demo.com | 1`
- `user.seed@demo.com  | 1`

## Resultado final del lab

- Migraciones EF Core: **OK**
- Seed idempotente: **OK**
- Segunda migración controlada: **OK**
- Historial consistente: **OK**
- Columna LastLoginAt creada en Users: **OK**

## Archivos relevantes

- `templates/dotnet10-api/src/Program.cs`
- `templates/dotnet10-api/src/Application/Seed.cs`
- `templates/dotnet10-api/src/Domain/User.cs`
- `templates/dotnet10-api/src/Infrastructure/AppDb.cs`
- `templates/dotnet10-api/src/Migrations/20260318020858_AddLastLoginAt.cs`
- `templates/dotnet10-api/src/Migrations/20260318020858_AddLastLoginAt.Designer.cs`
- `templates/dotnet10-api/src/Migrations/AppDbModelSnapshot.cs`
