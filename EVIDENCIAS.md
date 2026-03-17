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
