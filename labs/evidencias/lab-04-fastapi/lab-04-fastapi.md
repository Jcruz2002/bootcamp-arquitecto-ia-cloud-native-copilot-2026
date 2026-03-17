# Evidencias Lab 04 - FastAPI servicio productivo basico

## Objetivo
Implementar servicio FastAPI con contratos claros y pruebas basicas.

## Estatus
COMPLETADO - API funcional con CRUD, validaciones, OpenAPI y pruebas en verde.

## Arquitectura y estructura aplicada
Se mantuvo una estructura simple para el template del laboratorio:
- src/app.py: API FastAPI con modelos, rutas y manejo de errores.
- tests/test_app.py: pruebas de endpoints criticos.
- requirements.txt: dependencias de runtime y testing.

## Paso 1 - Modelos y rutas principales
Implementado en src/app.py:
- Modelos de entrada/salida con Pydantic:
  - UserCreate
  - UserUpdate
  - UserOut
  - ErrorResponse
- Rutas principales:
  - GET /health
  - GET /api/v1/users
  - GET /api/v1/users/{user_id}
  - POST /api/v1/users
  - PUT /api/v1/users/{user_id}
  - DELETE /api/v1/users/{user_id}

## Paso 2 - Operaciones CRUD basicas
Implementado con repositorio en memoria (users_db) para el alcance del lab:
- Crear usuario con id UUID y timestamps UTC.
- Listar usuarios con paginacion (skip, limit).
- Obtener usuario por id.
- Actualizar usuario parcialmente.
- Eliminar usuario por id.

## Paso 3 - Documentacion OpenAPI
FastAPI expone automaticamente:
- OpenAPI JSON: /openapi.json
- Swagger UI: /docs

## Paso 4 - Validacion y manejo de errores
Reglas aplicadas:
- name: minimo 3 caracteres.
- email: formato valido (EmailStr).
- status: active o inactive.
- email unico (conflicto 409).
- 404 cuando el usuario no existe.
- 422 para errores de validacion de payload.

## Paso 5 - Pruebas de endpoints criticos
Archivo: tests/test_app.py
Casos probados:
- Health check responde 200.
- Crear y consultar usuario.
- Email duplicado responde 409.
- Actualizar y eliminar usuario.
- Validacion invalida responde 422.

Resultado de pruebas:
- 5 passed, 1 warning

## Comandos ejecutados
```bash
cd templates/fastapi
/usr/local/python/3.12.1/bin/python -m pip install -r requirements.txt
/usr/local/python/3.12.1/bin/python -m pytest -q
```

## Endpoints para pruebas manuales
Base URL: http://localhost:8000

- GET /health
- GET /docs
- GET /openapi.json
- GET /api/v1/users?skip=0&limit=10
- GET /api/v1/users/{user_id}
- POST /api/v1/users
  Body ejemplo:
  {
    "name": "Juan Perez",
    "email": "juan@demo.com",
    "status": "active"
  }
- PUT /api/v1/users/{user_id}
  Body ejemplo:
  {
    "name": "Juan Carlos Perez",
    "status": "inactive"
  }
- DELETE /api/v1/users/{user_id}

## Conclusiones
- El servicio cumple el contrato esperado para un backend FastAPI productivo basico.
- OpenAPI facilita validacion manual y comunicacion de contrato.
- Las pruebas cubren flujo CRUD base y errores clave.
