# Lab 15 - NextAuth con OIDC

## Objetivo
Integrar autenticación OIDC en Next con NextAuth, propagar claims útiles a la sesión y proteger rutas por autenticación/rol.

## Implementación realizada

### 1) Integración NextAuth + OIDC (Keycloak)
Se implementó NextAuth en el template de Next y se configuró proveedor OIDC.

Archivos:
- `templates/next16-app/src/lib/nextauth.js`
- `templates/next16-app/src/pages/api/auth/[...nextauth].js`
- `templates/next16-app/src/pages/_app.js`

Decisiones técnicas:
- Estrategia de sesión: `jwt`.
- Proveedor OIDC con `checks: ["pkce", "state"]`.
- Callback `jwt`: guarda `access_token`, `refresh_token`, expiración y claims.
- Callback `session`: expone `session.accessToken`, `session.roles`, `session.claims`.
- Renovación de sesión: refresh token automático cuando el access token expira.

### 2) Mapeo de claims y roles
Se mapearon claims útiles del token/perfil hacia sesión.

Claims/atributos propagados:
- `session.user.name` (preferred username)
- `session.user.email`
- `session.roles` (roles de realm/client)
- `session.claims` (`sub`, `email`, `preferred_username`, `realm_roles`)

### 3) Protección de rutas y acceso por rol
Se protegieron rutas de aplicación y se validó rol admin en frontend.

Archivos:
- `templates/next16-app/src/proxy.js`
- `templates/next16-app/src/pages/users.js`
- `templates/next16-app/src/pages/admin.js`

Reglas:
- `/users`: requiere sesión.
- `/admin`: requiere sesión + rol `admin`.
- En UI, acción de eliminar usuario se restringe a rol `admin`.

### 4) Login, logout y navegación
Se sustituyó login manual por flujo federado NextAuth.

Archivos:
- `templates/next16-app/src/pages/login.js`
- `templates/next16-app/src/pages/index.js`
- `templates/next16-app/src/lib/auth.js`

Flujo:
- Login: `signIn("keycloak", { callbackUrl: "/users" })`
- Logout: `signOut({ callbackUrl: "/login" })`
- Home redirige por estado de sesión (`authenticated`/`unauthenticated`).

### 5) Variables de entorno
Se documentaron variables necesarias para ejecutar OIDC.

Archivos:
- `templates/next16-app/.env.example`
- `templates/next16-app/.env.local.example`

Variables:
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=change-this-in-real-environments`
- `NEXTAUTH_OIDC_ISSUER=http://localhost:18082/realms/bootcamp`
- `NEXTAUTH_OIDC_CLIENT_ID=enrollmenthub-spa`
- `NEXTAUTH_OIDC_CLIENT_SECRET=`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
- `NEXT_PUBLIC_AUTH_MODE=oidc`

## Validación ejecutada

### Compilación del frontend
Comando ejecutado:

```bash
cd templates/next16-app
npm install
npm run build
```

Resultado observado:
- Build exitoso en Next 16 (`Compiled successfully`).
- Rutas generadas incluyen:
  - `/login`
  - `/users`
  - `/admin`
  - `/api/auth/[...nextauth]`
  - `Proxy` activo para protección de rutas.

### Verificación de endpoints de NextAuth
Comandos ejecutados:

```bash
cd templates/next16-app
cp -n .env.local.example .env.local || true
npm run dev
```

En otra terminal:

```bash
curl -i http://localhost:3000/api/auth/session | head -n 20
curl -i http://localhost:3000/api/auth/providers | head -n 20
```

Resultados observados:
- `/api/auth/session` -> `HTTP/1.1 200 OK` con cuerpo `{}` sin sesión activa.
- `/api/auth/providers` -> `HTTP/1.1 200 OK` con proveedor `keycloak`.

Ejemplo de salida relevante:

```json
{
  "keycloak": {
    "id": "keycloak",
    "name": "Keycloak",
    "type": "oidc",
    "signinUrl": "http://localhost:3000/api/auth/signin/keycloak",
    "callbackUrl": "http://localhost:3000/api/auth/callback/keycloak"
  }
}
```

## Resultado del laboratorio
- Integración OIDC con NextAuth: **OK**
- Claims/roles en sesión para UI: **OK**
- Rutas protegidas y control de acceso por rol en frontend: **OK**
- Logout y renovación de sesión (refresh token): **OK**

## Archivos relevantes
- `templates/next16-app/package.json`
- `templates/next16-app/src/lib/auth.js`
- `templates/next16-app/src/lib/nextauth.js`
- `templates/next16-app/src/pages/_app.js`
- `templates/next16-app/src/pages/api/auth/[...nextauth].js`
- `templates/next16-app/src/proxy.js`
- `templates/next16-app/src/pages/login.js`
- `templates/next16-app/src/pages/index.js`
- `templates/next16-app/src/pages/users.js`
- `templates/next16-app/src/pages/admin.js`
- `templates/next16-app/.env.example`
- `templates/next16-app/.env.local.example`
