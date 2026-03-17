# Evidencia Lab 07 - Docker y publicacion en GHCR

## Objetivo
Empaquetar backend y frontend en imagenes Docker, validarlas en ejecucion local y preparar/publicar tags hacia GitHub Container Registry (GHCR).

## Prerrequisitos usados
- Backend .NET de Lab 03 funcional.
- Frontend Next de Lab 05 funcional.
- Docker disponible en el entorno.

## Implementacion realizada

### Dockerfiles revisados
- Backend: `templates/dotnet10-api/Dockerfile`.
- Frontend: `templates/next16-app/Dockerfile`.

### Optimizacion agregada para build context
Se crearon archivos `.dockerignore` para evitar subir dependencias/artefactos al contexto de Docker:
- `templates/dotnet10-api/.dockerignore`
- `templates/next16-app/.dockerignore`

Esto reduce tamaño de contexto y evita incluir archivos no necesarios (por ejemplo `node_modules`, `.next`, `bin`, `obj`).

## Comandos ejecutados
```bash
# Build de imagenes (tag Lab 07)
docker build -t ghcr.io/jcruz2002/backend:lab07 templates/dotnet10-api
docker build -t ghcr.io/jcruz2002/frontend:lab07 templates/next16-app

# Ejecucion local en contenedor
docker run -d --name lab07-backend -p 18080:8080 ghcr.io/jcruz2002/backend:lab07
docker run -d --name lab07-frontend -p 13000:3000 ghcr.io/jcruz2002/frontend:lab07

# Validacion HTTP
curl http://localhost:18080/health
curl http://localhost:13000

# Intento de publicacion GHCR
docker push ghcr.io/jcruz2002/backend:lab07
docker push ghcr.io/jcruz2002/frontend:lab07
```

## Resultado esperado
- Imagenes construidas correctamente.
- Contenedores levantando en local.
- Publicacion de tags en GHCR.

## Resultado obtenido
### 1) Imagenes locales construidas
- `ghcr.io/jcruz2002/backend:lab07` - ID `12170533d14c` - 163MB
- `ghcr.io/jcruz2002/frontend:lab07` - ID `b92354ec6307` - 626MB

### 2) Contenedores validados
- `lab07-backend` en `http://localhost:18080`.
- `lab07-frontend` en `http://localhost:13000`.

Estado (`docker ps`): ambos en estado `Up`.

### 3) Validacion funcional por HTTP
- Backend health: `GET http://localhost:18080/health` -> `200` con `{"status":"ok"...}`.
- Frontend root: `GET http://localhost:13000` -> `200` devolviendo HTML de Next.

### 4) Publicacion GHCR
- Intento de push ejecutado para backend y frontend.
- Resultado actual: `unauthorized: unauthenticated: User cannot be authenticated with the token provided.`

## Problemas y solucion
- Problema: push a GHCR rechazado por autenticacion.
- Solucion aplicada: no se publico aun; se requiere autenticacion de Docker contra GHCR con PAT de GitHub con permisos de paquetes.

Comando sugerido para resolverlo:
```bash
echo <GITHUB_PAT_CON_SCOPE_WRITE_PACKAGES> | docker login ghcr.io -u jcruz2002 --password-stdin
```

Luego reintentar:
```bash
docker push ghcr.io/jcruz2002/backend:lab07
docker push ghcr.io/jcruz2002/frontend:lab07
```

## Trazabilidad de versionado
- Tag de laboratorio: `lab07`.
- Repositorio objetivo de imagenes:
  - `ghcr.io/jcruz2002/backend:lab07`
  - `ghcr.io/jcruz2002/frontend:lab07`

## Capturas o logs
- Logs de build Docker exitoso para backend y frontend.
- Salida de `docker ps` con contenedores `Up`.
- Salida de `curl` con HTTP 200 para backend y frontend.
- Salida de `docker push` con error de autenticacion GHCR (evidencia del bloqueo pendiente).

## Conclusiones
El objetivo tecnico principal del Lab 07 se cumplio en entorno local: imagenes creadas, etiquetadas y contenedores funcionando correctamente. La publicacion en GHCR quedo pendiente unicamente por autenticacion (PAT/credenciales), no por errores de empaquetado.
