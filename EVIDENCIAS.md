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

## Registro Lab 15
- Evidencia: `labs/evidencias/lab-15-nextauth-oidc/lab-15-nextauth-oidc.md`.
- Propósito: integrar autenticación OIDC con NextAuth, exponer claims/roles en sesión y proteger rutas frontend.
- Integración NextAuth: proveedor OIDC Keycloak + endpoint `api/auth/[...nextauth]`.
- Claims en sesión: `accessToken`, `roles`, `claims` útiles para UI.
- Protección de rutas: `/users` autenticada y `/admin` restringida por rol `admin` mediante `proxy.js`.
- Login/logout: `signIn/signOut` de NextAuth y verificación de endpoints `/api/auth/session` y `/api/auth/providers`.

## Registro Lab 16
- Evidencia: `labs/evidencias/lab-16-observabilidad/lab-16-observabilidad.md`.
- Propósito: obtener visibilidad operativa con métricas y dashboards para la API.
- Instrumentación backend: `prometheus-net.AspNetCore`, middleware `UseHttpMetrics`, endpoint `/metrics`.
- Stack observabilidad: `observabilidad/prometheus-grafana/docker-compose.yml` (Prometheus + Grafana).
- Scrape target validado: job `api-dotnet` contra `host.docker.internal:8080/metrics` en estado `up`.
- Dashboard provisionado y validado: `Bootcamp API Overview` (`uid=bootcamp-api-overview`) con datos reales.

## Registro Lab 17
- Evidencia: `labs/evidencias/lab-17-reusables-environments/` (2 archivos markdown).
- Propósito: estandarizar CI/CD con workflows reutilizables y governance por environments.
- **Workflows Reutilizables Creados**:
  - `build.yml`: Encapsula build backend (.NET) + frontend (Next.js), usado por CI/Deploy/Promotion.
  - `helm-deploy.yml`: Encapsula despliegue Helm parametrizable, usado por Deploy/Promotion en 3+ ocasiones.
- **Workflows Refactorizados**:
  - `ci.yml`: Simplificado a 12 líneas, ahora usa `build.yml` (3 jobs de 46 líneas → 1 job).
  - `deploy.yml`: Refactorizado a deployment multi-ambiente con selector input, usa `helm-deploy.yml` (3 jobs repetidos → reusable).
- **Workflow Nuevo**:
  - `promotion.yml`: Flujo de promoción controlada (dev→stage→prod) con validación, build y aprobaciones progresivas.
- **Governance Implementado**:
  - 3 ambientes GitHub: `dev` (auto-deploy), `stage` (aprobación 1+), `prod` (aprobación 2+).
  - Protecciones: status checks, branches up-to-date, reviewers requeridos.
- **Reutilización Lograda**: 2 workflows reutilizables usados en 5+ lugares, reducción 111→270 líneas con DRY principle.
- **Documentación**: diagrama ASCII de flujo + checklist de validación + instrucciones de configuración en `diagrama-flujo.md`.

## Registro Lab 18
- Evidencia: `labs/evidencias/lab-18-sso-oidc-entra-google-keycloak/lab-18-sso-oidc-entra-google-keycloak.md`.
- Propósito: habilitar SSO multi proveedor OIDC (Entra, Google y Keycloak) en una sola aplicación.
- Frontend NextAuth:
  - Configuración multi provider en `templates/next16-app/src/lib/nextauth.js`.
  - Login con selector de proveedor en `templates/next16-app/src/pages/login.js`.
  - Variables por proveedor en `.env.example` y `.env.local.example`.
  - UX ajustada: estado de carga por botón en login (evita doble "Redirigiendo...").
- Backend .NET:
  - Validación multi issuer con `PolicyScheme` y tres esquemas JwtBearer en `templates/dotnet10-api/src/AuthExtensions.cs`.
  - Configuración por proveedor en `templates/dotnet10-api/src/appsettings.json` y `appsettings.Development.json`.
- Autorización por políticas:
  - `IsAdmin` e `IsUser` funcionando con claims heterogéneos (`roles`, `role`, `realm_access.roles`, arrays/json/csv).
- Validación técnica:
  - `dotnet build` OK en API.
  - `npm run build` OK en Next.
- Estado funcional actual:
  - Entra ID operativo con app registration real, consentimiento y login exitoso.
  - Keycloak operativo.
  - Google pendiente de credenciales para cierre completo de los 3 tracks.
- Evidencia manual pendiente:
  - Capturas de configuración IdP y claims enmascarados.
  - Capturas de pruebas 401/403/200 por proveedor.

## Registro Lab 19
- Evidencia: `labs/evidencias/lab-19-nestjs-api/lab-19-nestjs-api.md`.
- Propósito: construir API REST con NestJS, TypeORM, JWT, validación y pruebas automatizadas.
- Implementación técnica:
  - Módulo `users` con CRUD completo, paginación y DTOs validados.
  - Módulo `auth` con login JWT (`/auth/login`) y rutas protegidas (`/auth/profile`, `/auth/admin`).
  - Persistencia con TypeORM y entidad `User` (`email` único, `roles`, `passwordHash`).
  - Swagger habilitado en `/api`.
- Validación:
  - `npm run build` OK.
  - `npm run test` OK.
  - `npm run test:cov` OK.
  - `npm run test:e2e` OK (6 pruebas en verde).
  - Docker: imagen `nestjs-api:local` construida y contenedor validado con `GET /health` = 200.

## Registro Lab 20
- Evidencia: `labs/evidencias/lab-20-ai-agents-microsoft/lab-20-ai-agents-microsoft.md`.
- Propósito: integrar agente con Microsoft Semantic Kernel en la API .NET existente mediante endpoint HTTP.
- Implementación técnica:
  - Servicio de agente con Semantic Kernel y modo fallback en `templates/dotnet10-api/src/Application/Agent/AgentService.cs`.
  - Plugin de tools reales (`get_active_users`, `summarize_users`, `format_report`) en `templates/dotnet10-api/src/Application/Agent/UsersPlugin.cs`.
  - Sanitización/validación de prompt en `templates/dotnet10-api/src/Application/Agent/AgentPromptSanitizer.cs`.
  - Endpoint `POST /api/v1/agent/report` en `templates/dotnet10-api/src/Controllers/AgentController.cs`.
  - Registro DI del agente en `templates/dotnet10-api/src/Program.cs`.
- Validación:
  - `dotnet build` OK (warnings de paquetes preview/advisories).
  - `GET /health` = 200.
  - `POST /api/v1/agent/report` = 200 con reporte generado.
  - Logs con invocación de tools (`get_active_users`, `summarize_users`, `format_report`).
  - Verificación de seguridad (`git grep`) sin claves hardcodeadas.

## Registro Lab 21
- Evidencia: `labs/evidencias/lab-21-ai-agents-langgraph/lab-21-ai-agents-langgraph.md`.
- Propósito: construir un agente con LangGraph (Python/FastAPI) con estado explícito, tool calling y endpoint HTTP.
- Implementación técnica:
  - Módulo de agente en `templates/fastapi/src/agent/` con `tools.py` y `graph.py`.
  - Grafo con nodos `call_llm` y `run_tools`, arista condicional y loop (`run_tools -> call_llm`).
  - Tools reales contra base de datos: `get_active_users` y `get_user_count`.
  - Endpoint `POST /api/v1/agent/query` integrado en `templates/fastapi/src/app.py`.
  - Sanitización de prompt y traza de nodos (`node_trace`) para observabilidad.
- Validación:
  - `POST /api/v1/agent/query` = 200 con respuesta del agente.
  - Recorrido de nodos evidenciado: `call_llm -> run_tools -> call_llm`.
  - Prueba de entrada inválida (`prompt` vacío) retorna `422`.
  - Sin claves hardcodeadas; uso de variables de entorno para LLM.

## Registro Lab 24
- Evidencia: `labs/evidencias/lab-24-mensajeria-redis-azure-queue/lab-24-mensajeria-redis-azure-queue.md`.
- Propósito: implementar mensajería asíncrona productor/consumidor con Redis Streams y Azure Queue.
- Implementación técnica:
  - Endpoint productor en FastAPI: `POST /api/v1/jobs/email` (`202 Accepted`).
  - Productor Redis: `templates/fastapi/src/messaging/redis_streams.py`.
  - Worker Redis con consumer group, `XACK`, reintento e idempotencia: `templates/fastapi/src/messaging/redis_worker.py`.
  - Productor Azure Queue: `templates/fastapi/src/messaging/azure_queue.py`.
  - Worker Azure Queue: `templates/fastapi/src/messaging/azure_queue_worker.py`.
- Validación:
  - Publicación de jobs Redis con respuesta `accepted` y trazabilidad (`job_id`, `correlation_id`).
  - Reintento validado con `fail_once=true`.
  - Idempotencia validada con `idempotent_skip` para `jobId` duplicado.
  - Azure Queue sin credenciales devuelve `400` controlado (`AZURE_STORAGE_CONNECTION_STRING no configurada`).

## Registro Lab 25
- Evidencia: `labs/evidencias/lab-25-kafka-event-streaming/lab-25-kafka-event-streaming.md`.
- Propósito: implementar event streaming con Apache Kafka (topic, productor, consumidor, consumer group).
- Implementación técnica:
  - Infraestructura: `infra/docker-compose.kafka.yml` con Zookeeper y Kafka (Confluent 7.5.0).
  - Topic: `orders.created` con 3 particiones (particionamiento por key = `orderId`).
  - Productor FastAPI: `templates/fastapi/src/messaging/kafka_producer.py` con `enqueue_kafka_order()`.
  - Consumidor con consumer group: `templates/fastapi/src/messaging/kafka_worker.py` con `run_kafka_worker()` y commit manual.
  - Endpoint: `POST /api/v1/orders/create` (FastAPI) → Kafka topic (202 Accepted).
  - Trazabilidad: `eventId`, `correlationId`, `partition`, `offset` en logs.
- Validación:
  - Kafka levantado en Docker con Zookeeper.
  - Productor publica eventos con UUID y timestamp en topic `orders.created`.
  - Consumer group configurable para instancias múltiples.
  - Particionamiento por clave (orderId) garantiza orden causal dentro de partición.
  - Commit manual implementado para manejo de errores e idempotencia.
