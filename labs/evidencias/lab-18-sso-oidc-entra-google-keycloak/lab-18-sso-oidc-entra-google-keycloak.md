# Lab 18 - SSO con OIDC en Entra ID, Google y Keycloak

## Objetivo
Implementar SSO y autorizacion por roles en una misma aplicacion, habilitando tres proveedores OIDC:
- Microsoft Entra ID
- Google Cloud Identity / Google Workspace
- Keycloak

## Implementacion realizada

### Frontend (NextAuth multi proveedor)
Se implemento soporte de proveedores OIDC concurrentes en NextAuth:
- Keycloak
- Google
- Microsoft Entra ID

Archivo principal:
- templates/next16-app/src/lib/nextauth.js

Cambios clave:
1. Registro de multiples providers en la misma configuracion de NextAuth.
2. Mapeo de roles por proveedor:
   - Keycloak: realm_access/resource_access
   - Entra ID: claim roles/role
   - Google: mapeo por dominio y correo (configurable)
3. Enriquecimiento de sesion con provider, roles y claims utilies para autorizacion UI.
4. Renovacion de token habilitada para Keycloak y expiracion controlada para otros proveedores.

Variables de entorno agregadas:
- NEXTAUTH_KEYCLOAK_ISSUER
- NEXTAUTH_KEYCLOAK_CLIENT_ID
- NEXTAUTH_KEYCLOAK_CLIENT_SECRET
- NEXTAUTH_GOOGLE_CLIENT_ID
- NEXTAUTH_GOOGLE_CLIENT_SECRET
- NEXTAUTH_GOOGLE_ADMIN_DOMAIN
- NEXTAUTH_GOOGLE_STUDENT_DOMAIN
- NEXTAUTH_ENTRA_CLIENT_ID
- NEXTAUTH_ENTRA_CLIENT_SECRET
- NEXTAUTH_ENTRA_TENANT_ID
- NEXTAUTH_ADMIN_EMAILS

Archivos actualizados:
- templates/next16-app/.env.example
- templates/next16-app/.env.local.example
- templates/next16-app/src/pages/login.js
- templates/next16-app/src/pages/index.js
- templates/next16-app/src/styles/globals.css

### Backend (.NET JwtBearer multi issuer)
Se extendio la API para validar tokens de multiples IdP en paralelo mediante seleccion dinamica de esquema de autenticacion segun issuer del JWT.

Archivo principal:
- templates/dotnet10-api/src/AuthExtensions.cs

Cambios clave:
1. Registro de 3 esquemas JwtBearer:
   - oidc-keycloak
   - oidc-google
   - oidc-entra
2. PolicyScheme dinamico (oidc-multi) para enrutar cada token al esquema correcto usando claim iss.
3. Configuracion por proveedor en appsettings:
   - Oidc:Providers:Keycloak
   - Oidc:Providers:Google
   - Oidc:Providers:Entra
4. Politicas IsAdmin e IsUser robustas con evaluacion de roles en distintos formatos de claim:
   - roles
   - role
   - realm_access.roles
   - arrays/json/csv

Archivos actualizados:
- templates/dotnet10-api/src/appsettings.json
- templates/dotnet10-api/src/appsettings.Development.json

## Validaciones realizadas

### Compilacion backend
Comando:
- dotnet build (templates/dotnet10-api/src)

Resultado:
- Build OK
- Sin errores de compilacion

### Compilacion frontend
Comando:
- npm run build (templates/next16-app)

Resultado:
- Build OK
- Paginas login/users/admin generadas correctamente
- Endpoint /api/auth/[...nextauth] operativo

## Pruebas funcionales esperadas por proveedor

### 1. Keycloak
1. Login desde /login con boton Keycloak.
2. Obtener access token en sesion.
3. Llamar endpoint protegido:
   - Sin token -> 401
   - Con token sin rol admin -> 403 en /api/v1/access/admin
   - Con rol admin -> 200 en /api/v1/access/admin

### 2. Google
1. Login desde /login con boton Google.
2. Validacion de token por issuer Google en backend.
3. Aplicar politica por dominio/correo segun variables:
   - NEXTAUTH_GOOGLE_ADMIN_DOMAIN
   - NEXTAUTH_ADMIN_EMAILS
4. Verificar 401/403/200 segun caso.

### 3. Entra ID
1. Login desde /login con boton Entra ID.
2. Validacion de token por issuer login.microsoftonline.com.
3. Validar rol app role en claim roles:
   - Sin rol admin -> 403 en /api/v1/access/admin
   - Con rol admin -> 200 en /api/v1/access/admin

## Estado real validado en esta ejecucion

### Entra ID (completado)
- App registration creada en Azure AD: `bootcamp-lab18-nextauth-local`.
- Redirect URI configurada: `http://localhost:3000/api/auth/callback/azure-ad`.
- Configuracion multi-tenant habilitada (`AzureADMultipleOrgs`).
- Tenant de frontend configurado a `common` para login generico Microsoft.
- Proveedor `azure-ad` visible y operativo en `/api/auth/providers`.
- Flujo de consentimiento y redireccion al home probado en navegador.

### UI login (completado)
- Ajuste de estado de carga por proveedor para evitar que ambos botones muestren "Redirigiendo..." al mismo tiempo.
- Layout de botones mejorado para separacion y ancho consistente.

## Evidencia de trazabilidad
- Se centralizo autenticacion OIDC para tres IdP en un mismo flujo de frontend.
- Se centralizo autorizacion backend con seleccion de esquema por issuer.
- Se mantienen endpoints existentes de prueba 401/403/200 en AccessController.

## Seguridad de configuracion
- Secrets separados por proveedor.
- Audience configurable por proveedor.
- RequireHttpsMetadata activo por defecto en Google y Entra.
- Fallback provider configurable con Oidc:DefaultProvider.

## Pendientes manuales para cierre completo
1. Completar track Google (crear OAuth Client ID y cargar variables en entorno local).
2. Capturar pantallas de:
   - configuracion de cada IdP
   - claims/token enmascarados
   - resultados 401/403/200 por proveedor

## Conclusiones
Se completo la base tecnica de Lab 18 con arquitectura multi-proveedor OIDC en frontend y backend, manteniendo una sola politica de autorizacion para los tres IdP.
