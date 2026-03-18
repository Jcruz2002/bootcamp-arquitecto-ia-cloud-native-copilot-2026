# Evidencias del Bootcamp

## Convencion de ramas
- `main`: rama estable protegida.
- `develop`: rama de integracion de avances.
- `lab-XX[-descripcion-corta]`: rama por laboratorio.
  - Ejemplos: `lab-01`, `lab-04-fastapi`, `lab-15-nextauth`.

## Plantilla de evidencia por laboratorio

# Evidencias Lab XX

## Objetivo
## Comandos ejecutados
## Resultado esperado
## Resultado obtenido
## Problemas y solucion
## Capturas o logs

## Registro Lab 06
- Evidencia: `labs/evidencias/lab-06-angular21/lab-06-angular21.md`
- Comparativa Angular vs Next: incluida en la seccion final de esa evidencia.

## Registro Lab 07
- Evidencia: `labs/evidencias/lab-07-docker-ghcr/lab-07-docker-ghcr.md`
- Tags usados: `ghcr.io/jcruz2002/backend:lab07` y `ghcr.io/jcruz2002/frontend:lab07`.
- Estado GHCR: build y validacion local OK; push pendiente por autenticacion (`docker login ghcr.io`).

## Registro Lab 08
- Evidencia: `labs/evidencias/lab-08-actions/lab-08-actions.md`.
- Workflow CI: `.github/workflows/ci.yml`.
- Workflow release GHCR: `.github/workflows/release-ghcr.yml`.
- Links de ejecuciones documentados en la evidencia del laboratorio.

## Registro Lab 09
- Evidencia: `labs/evidencias/lab-09-k8s-helm/lab-09-k8s-helm.md`.
- Helm Chart: `infra/helm/app/` (enrollmenthub v0.1.0).
- Values: `values.yaml` (prod: 2 replicas), `VALUES-dev.yaml` (dev/minikube: 1 replica).
- Manifiestos: Deployments (api-dotnet, app-next), Services (ClusterIP), Ingress (nginx).
- Scripts automáticos:
  - `infra/helm/deploy-lab09.sh` - Despliegue automático (preflightchecks + helm deploy + smoke tests)
  - `infra/helm/cleanup-lab09.sh` - Limpieza de recursos
  - `infra/helm/verify-lab09.sh` - Verificación de estado
- Guía rápida: `infra/helm/README-LAB09.md`
- Validación: `helm template app infra/helm/app -n app` ✓ (sin errores, 5 recursos generados)
- Despliegue real (2026-03-17): `helm upgrade --install` en minikube ✓
- Estado runtime: `api-dotnet 1/1 Running`, `app-next 1/1 Running` ✓
- Smoke test real: Frontend `HTTP 200` y Backend `/health` `200` con `{"status":"ok"...}` ✓
- Extensión opcional: Kong/Konga no desplegado (pendiente opcional).

## Registro Lab 10
- Evidencia: `labs/evidencias/lab-10-argocd/lab-10-argocd.md`.
- Argo CD: instalado en namespace `argocd` (manifiesto oficial + server-side apply).
- Application: `enrollmenthub` en `infra/gitops/argocd/app.yaml`.
- Fuente GitOps: repo `Jcruz2002/bootcamp-arquitecto-ia-cloud-native-copilot-2026`, rama `lab-10`, path `infra/helm/app`.
- Sync Policy: automatica (`prune`, `selfHeal`) + `CreateNamespace=true`.
- Validacion final: `sync=Synced`, `health=Healthy` ✓
- Prueba GitOps: cambio en chart (`deploy-frontend.yaml`) detectado por Argo CD, rollout automatico y nuevo `revision` aplicado ✓

## Registro Lab 11
- Evidencia: `labs/evidencias/lab-11-oidc/lab-11-oidc.md`.
- Proveedor inicial OIDC: Keycloak local (`infra/docker-compose.oidc.yml`, `infra/oidc/keycloak/realm-bootcamp.json`).
- Backend OIDC/JwtBearer: soporte modo `local|oidc` y politicas `IsAdmin`/`IsUser`.
- Endpoints de prueba acceso por rol: `GET /api/v1/access/authenticated` y `GET /api/v1/access/admin`.
- Frontend login OIDC: integrado en Next (`templates/next16-app/src/pages/login.js`) con variables en `.env.local.example`.
- Validacion acceso por rol: 401 sin token, 403 user en admin, 200 admin en admin, 200 user autenticado ✓

## Registro Lab 12
- Evidencia: `labs/evidencias/lab-12-data-at-scale/lab-12-data-at-scale.md`.
- Dataset: 200,002 usuarios en PostgreSQL (170,168 activos).
- Baseline SQL: Query A `130.929 ms`, Query B `119.335 ms`.
- Mejora con indices: Query A `0.700 ms`, Query B `1.510 ms`.
- Cache Redis (lectura frecuente): warm avg `0.011319 s` vs no-cache avg `0.019575 s`.
- Conclusiones y trade-offs documentados (latencia vs costo de escritura/cache consistency).

## Registro Lab 13
- Evidencia: `labs/evidencias/lab-13-efcore-migrations/lab-13-efcore-migrations.md`.
- API base utilizada: `templates/dotnet10-api/src` (Lab 03).
- Migración base existente: `InitialCreate`.
- Seed idempotente implementado por email en `Application/Seed.cs` (sin duplicados).
- Segunda migración aplicada: `AddLastLoginAt` (campo `LastLoginAt` nullable en `Users`).
- Historial migraciones validado: `InitialCreate` + `AddLastLoginAt` en `__EFMigrationsHistory`.
- Nota técnica: migración ajustada con `IF NOT EXISTS` para compatibilidad con índices ya creados en Lab 12.

## Registro Lab 14
- Evidencia: `labs/evidencias/lab-14-alembic-fastapi/lab-14-alembic-fastapi.md`.
- Propósito: versionar y aplicar cambios de esquema en FastAPI con Alembic de forma reproducible entre entornos.
- Configuración Alembic completada: `alembic.ini`, `env.py`, `script.py.mako`.
- Revisión inicial creada y aplicada: `484c69d43034_init.py`.
- Cambio controlado de modelo: columna `last_login_at` en `users`.
- Segunda revisión creada y aplicada: `331003611bd6_add_last_login_at.py`.
- Estado final validado en DB: `alembic_version = 331003611bd6` y columna `last_login_at` existente (`timestamp with time zone`, nullable).
