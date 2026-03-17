# Evidencia Lab 08 - GitHub Actions CI/CD

## Objetivo
Automatizar build, validacion y publicacion de imagenes con GitHub Actions, separando claramente el pipeline de CI del pipeline de release a GHCR.

## Implementacion realizada

### 1) Workflow de CI
Archivo: `.github/workflows/ci.yml`

Cobertura implementada:
- Disparo en `pull_request` hacia `main`.
- Disparo en `push` a `main`.
- Job `build-backend`:
  - `actions/setup-dotnet@v4`
  - `dotnet restore`
  - `dotnet build -c Release --no-restore`
- Job `build-frontend`:
  - `actions/setup-node@v4`
  - cache de npm
  - `npm ci`
  - `npm run build`

Resultado esperado de CI:
- Validar compilacion de backend y frontend antes de merge.

### 2) Workflow de release
Archivo: `.github/workflows/release-ghcr.yml`

Cobertura implementada:
- Disparo en `push` a `main` y `workflow_dispatch`.
- Permisos del workflow:
  - `contents: read`
  - `packages: write`
- Variables de entorno:
  - `BACKEND_IMAGE=ghcr.io/<owner>/enrollmenthub-backend`
  - `FRONTEND_IMAGE=ghcr.io/<owner>/enrollmenthub-frontend`
- Publicacion de imagen backend y frontend con tags:
  - `latest`
  - `${{ github.sha }}`

Resultado esperado de release:
- Publicar imagenes versionadas en GHCR de forma trazable.

### 3) Secrets y variables
Configuracion requerida en GitHub:
- No se requiere PAT adicional para push desde Actions cuando se usa `GITHUB_TOKEN` y permisos `packages: write`.
- Validar que el repositorio permita paquetes en GHCR para el owner.

### 4) Protecciones minimas de rama (main)
Configuracion recomendada en branch protection:
- Requerir PR antes de merge.
- Requerir status checks en verde:
  - `build-backend`
  - `build-frontend`
- Bloquear force push en `main`.

## Validacion tecnica
- Validacion de sintaxis YAML en workspace:
  - `.github/workflows/ci.yml` sin errores.
  - `.github/workflows/release-ghcr.yml` sin errores.
- Estructura CI/release separada correctamente (cumple objetivo del lab).

## Comandos de apoyo usados
```bash
# Revisar estructura de workflows
ls .github/workflows

# Verificar archivos
cat .github/workflows/ci.yml
cat .github/workflows/release-ghcr.yml
```

## Links de ejecuciones
- Actions (todas las ejecuciones):
  - https://github.com/Jcruz2002/bootcamp-arquitecto-ia-cloud-native-copilot-2026/actions
- CI workflow:
  - https://github.com/Jcruz2002/bootcamp-arquitecto-ia-cloud-native-copilot-2026/actions/workflows/ci.yml
- Release workflow:
  - https://github.com/Jcruz2002/bootcamp-arquitecto-ia-cloud-native-copilot-2026/actions/workflows/release-ghcr.yml

## Resultado obtenido
- Pipeline CI definido y listo para validacion en PR/main.
- Pipeline release definido y listo para publicar imagenes en GHCR en push a main o ejecucion manual.
- Trazabilidad de imagenes por SHA incluida.

## Problemas y solucion
- Problema detectado: workflow `ci.yml` previo mezclaba CI y push de imagenes en una sola definicion.
- Solucion aplicada: separacion en dos workflows (`ci.yml` y `release-ghcr.yml`) para mejorar control y seguridad.

## Conclusiones
El laboratorio queda implementado con una base CI/CD correcta: validacion continua en PR y release independiente para GHCR con versionado por SHA y `latest`.
