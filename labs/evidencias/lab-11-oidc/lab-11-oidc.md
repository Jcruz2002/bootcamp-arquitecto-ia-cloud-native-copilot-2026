# Lab 11 - OIDC base (Keycloak)

## Objetivo
Implementar autenticacion federada OIDC y autorizacion por roles (user/admin) con validacion de escenarios 401, 403 y 200.

## Proveedor inicial elegido
- Keycloak local en Docker.

## Implementacion realizada

### 1) Configuracion del proveedor OIDC

Archivos creados:
- `infra/docker-compose.oidc.yml`
- `infra/oidc/keycloak/realm-bootcamp.json`

Incluye:
- Realm `bootcamp`.
- Cliente OIDC `enrollmenthub-spa`.
- Usuarios de prueba:
  - `alice / alice123` con roles `admin,user`
  - `bob / bob123` con rol `user`
- Mapper para exponer roles en claim `roles` del access token.

Arranque:

```bash
docker compose -f infra/docker-compose.oidc.yml up -d
```

Discovery validado:

```text
issuer: http://localhost:18082/realms/bootcamp
authorization_endpoint: http://localhost:18082/realms/bootcamp/protocol/openid-connect/auth
token_endpoint: http://localhost:18082/realms/bootcamp/protocol/openid-connect/token
```

### 2) Integracion backend JwtBearer (modo OIDC)

Archivos actualizados:
- `templates/dotnet10-api/src/AuthExtensions.cs`
- `templates/dotnet10-api/src/Program.cs`
- `templates/dotnet10-api/src/appsettings.json`
- `templates/dotnet10-api/src/appsettings.Development.json`

Cambios claves:
- Soporte doble modo autenticacion:
  - `Auth:Mode=local` (JWT firmado localmente)
  - `Auth:Mode=oidc` (federado con Authority)
- Politicas de autorizacion:
  - `IsAdmin` -> rol `admin`
  - `IsUser` -> rol `user` o `admin`
- `MapInboundClaims=false` para respetar claim `roles` de Keycloak.
- Endpoints de validacion de acceso en:
  - `templates/dotnet10-api/src/Controllers/AccessController.cs`
    - `GET /api/v1/access/authenticated` (requiere token)
    - `GET /api/v1/access/admin` (requiere rol admin)

### 3) Integracion login en frontend

Archivos actualizados:
- `templates/next16-app/src/lib/auth.js`
- `templates/next16-app/src/pages/login.js`
- `templates/next16-app/.env.local.example`

Cambios claves:
- Nuevo modo `NEXT_PUBLIC_AUTH_MODE=oidc`.
- Boton de login OIDC que redirige al authorization endpoint del proveedor.
- Callback en `/login` que captura `access_token` y lo guarda para consumir API.
- Mantiene compatibilidad con login local del Lab 05 cuando `AUTH_MODE=local`.

Build validado:

```bash
cd templates/next16-app
npm run build
# Compiled successfully
```

## Pruebas de autorizacion (requisito 401/403/200)

Se obtuvieron tokens con password grant:

```bash
# bob (user)
POST /realms/bootcamp/protocol/openid-connect/token
username=bob&password=bob123&client_id=enrollmenthub-spa

# alice (admin)
POST /realms/bootcamp/protocol/openid-connect/token
username=alice&password=alice123&client_id=enrollmenthub-spa
```

Resultados verificados en API:

```text
401=401 403=403 200admin=200 200auth=200
```

Detalle:
1. 401 esperado
- `GET /api/v1/access/authenticated` sin token -> `401`

2. 403 esperado
- `GET /api/v1/access/admin` con token de `bob(user)` -> `403`

3. 200 esperado (admin)
- `GET /api/v1/access/admin` con token de `alice(admin)` -> `200`
- Body: `{"message":"Acceso admin permitido (esperado: 200 con rol admin)"}`

4. 200 esperado (autenticado)
- `GET /api/v1/access/authenticated` con token de `bob(user)` -> `200`
- Body: `{"message":"Acceso autenticado (esperado: 200)","user":"bob"}`

## Validacion final del lab

- Login federado y sesion estable: **OK**
- Endpoints protegidos por rol: **OK**
- Escenarios 401/403/200: **OK**

## Entregables

- Evidencia: `labs/evidencias/lab-11-oidc/lab-11-oidc.md`
- Registro en `EVIDENCIAS.md` actualizado
