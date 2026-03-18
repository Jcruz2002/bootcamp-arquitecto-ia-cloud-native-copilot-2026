# Lab 14 - Alembic para FastAPI

## Objetivo
Versionar cambios de base de datos en stack Python (FastAPI + SQLAlchemy + Alembic).

## Implementacion realizada

### 1) Configuracion de Alembic

Archivos configurados/creados:
- `templates/fastapi/alembic.ini`
- `templates/fastapi/alembic/env.py`
- `templates/fastapi/alembic/script.py.mako`
- `templates/fastapi/alembic/versions/`

Configuracion clave:
- URL DB: `postgresql+psycopg://postgres:example@localhost:5432/enrollmenthub`
- `target_metadata` enlazado a `Base.metadata` de SQLAlchemy.
- `compare_type=True` para detectar cambios de tipo.

### 2) Estructura SQLAlchemy para autogenerate

Archivos agregados:
- `templates/fastapi/src/database.py`
- `templates/fastapi/src/models.py`

Modelo base `users`:
- `id` (UUID PK)
- `name` (varchar 100)
- `email` (varchar 255, unique, indexed)
- `status` (varchar 20, indexed)
- `created_at`, `updated_at` (timestamp with time zone)

Integracion API:
- `templates/fastapi/src/app.py` migrado de almacenamiento en memoria a persistencia con SQLAlchemy.

Dependencias agregadas:
- `alembic>=1.13.2`
- `psycopg[binary]>=3.2.1`

### 3) Revision inicial

Comando:

```bash
cd templates/fastapi
/usr/local/python/3.12.1/bin/python -m alembic revision --autogenerate -m "init"
```

Archivo generado:
- `templates/fastapi/alembic/versions/484c69d43034_init.py`

Aplicacion:

```bash
/usr/local/python/3.12.1/bin/python -m alembic upgrade head
```

### 4) Cambio de modelo controlado

Cambio introducido en `templates/fastapi/src/models.py`:
- nuevo campo `last_login_at` nullable en `users`.

### 5) Segunda revision + upgrade

Comando:

```bash
/usr/local/python/3.12.1/bin/python -m alembic revision --autogenerate -m "add_last_login_at"
/usr/local/python/3.12.1/bin/python -m alembic upgrade head
```

Archivo generado:
- `templates/fastapi/alembic/versions/331003611bd6_add_last_login_at.py`

## Validacion

### Prueba ejecutada sobre la implementacion

Comandos ejecutados para validar el estado real del entorno:

```bash
cd /workspaces/bootcamp-arquitecto-ia-cloud-native-copilot-2026
docker compose -f infra/docker-compose.data.yml up -d postgres

cd templates/fastapi
/usr/local/python/3.12.1/bin/python -m alembic current
/usr/local/python/3.12.1/bin/python -m alembic history
/usr/local/python/3.12.1/bin/python -m alembic upgrade head

docker exec -i infra-postgres-1 psql -U postgres -d enrollmenthub -c "SELECT version_num FROM alembic_version;"
docker exec -i infra-postgres-1 psql -U postgres -d enrollmenthub -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position;"
```

Salidas relevantes observadas:

```text
331003611bd6 (head)
484c69d43034 -> 331003611bd6 (head), add_last_login_at
<base> -> 484c69d43034, init
```

```text
version_num
------------
331003611bd6
```

```text
column_name   | data_type                 | is_nullable
-------------|---------------------------|------------
id           | uuid                      | NO
name         | character varying         | NO
email        | character varying         | NO
created_at   | timestamp with time zone  | NO
updated_at   | timestamp with time zone  | NO
status       | character varying         | NO
last_login_at| timestamp with time zone  | YES
```

### Estado final de revision aplicada

Consulta:

```sql
SELECT version_num FROM alembic_version;
```

Resultado:
- `331003611bd6`

### Esquema final validado

Consulta:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name='users' AND column_name='last_login_at';
```

Resultado:
- `last_login_at | timestamp with time zone | YES`

## Resultado del laboratorio

- Flujo de migraciones reproducible: **OK**
- Consistencia de esquema: **OK**
- Revisión inicial + segunda revisión aplicadas: **OK**

## Archivos relevantes

- `templates/fastapi/alembic.ini`
- `templates/fastapi/alembic/env.py`
- `templates/fastapi/alembic/script.py.mako`
- `templates/fastapi/alembic/versions/484c69d43034_init.py`
- `templates/fastapi/alembic/versions/331003611bd6_add_last_login_at.py`
- `templates/fastapi/src/database.py`
- `templates/fastapi/src/models.py`
- `templates/fastapi/src/app.py`
- `templates/fastapi/requirements.txt`
