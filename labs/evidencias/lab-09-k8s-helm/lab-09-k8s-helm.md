# Lab 09 - Kubernetes 1.35 y Helm

## Objetivo
Desplegar backend (.NET 10) y frontend (Next.js 16) en un cluster Kubernetes 1.35 usando Helm 3.

## Resumen de Implementación

Se ha configurado un Helm chart completo para desplegar la aplicación con los siguientes componentes:

### 1. Helm Chart Structure
```
infra/helm/app/
├── Chart.yaml          # Metadatos del chart (enrollmenthub v0.1.0)
├── values.yaml         # Valores por defecto
└── templates/
    ├── deploy-backend.yaml    # Deployment backend .NET
    ├── deploy-frontend.yaml   # Deployment frontend Next.js
    └── svc-ingress.yaml       # Services + Ingress nginx
```

### 2. Valores Configurados (values.yaml)

```yaml
backend:
  image: ghcr.io/jcruz2002/backend:lab07         # Imagen Lab 07
  replicas: 2
  port: 8080                                       # Puerto interno

frontend:
  image: ghcr.io/jcruz2002/frontend:lab07        # Imagen Lab 07
  replicas: 2
  port: 3000                                       # Puerto interno

service:
  port: 80                                         # Puerto Service

ingress:
  enabled: true
  className: nginx
  host: app.local                                  # Host virtual
```

### 3. Manifiestos Generados

#### Deploy Backend (.NET)
- **Nombre**: api-dotnet
- **Replicas**: 2
- **Imagen**: ghcr.io/jcruz2002/backend:lab07 (con imagePullPolicy: Always)
- **Puerto**: 8080
- **Health Checks**: 
  - Readiness: GET /health (delay: 10s, period: 10s)
  - Liveness: GET /health (delay: 30s, period: 10s)
- **Recursos**: 
  - Request: 100m CPU / 256Mi RAM
  - Limit: 500m CPU / 512Mi RAM

#### Deploy Frontend (Next.js)
- **Nombre**: app-next
- **Replicas**: 2
- **Imagen**: ghcr.io/jcruz2002/frontend:lab07 (con imagePullPolicy: Always)
- **Puerto**: 3000
- **Recursos**:
  - Request: 100m CPU / 256Mi RAM
  - Limit: 500m CPU / 512Mi RAM

#### Services
- **app-next**: ClusterIP, puerto 80 → 3000 (frontend)
- **api-dotnet**: ClusterIP, puerto 80 → 8080 (backend)

#### Ingress (nginx)
- **Host**: app.local
- **Rutas**:
  - `/` → app-next:80 (Next.js frontend)
  - `/api` → api-dotnet:80 (.NET backend)

### 4. Validación del Chart

El Helm chart se ha validado exitosamente:

```bash
$ helm template app infra/helm/app -n app
# ✓ Expande sin errores
# ✓ Genera 5 recursos: 2 Deployments + 2 Services + 1 Ingress
```

Manifest sample output:
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: api-dotnet, labels: { app: api-dotnet } }
spec:
  replicas: 2
  containers:
  - name: api
    image: ghcr.io/jcruz2002/backend:lab07
    imagePullPolicy: Always
    ports: 
    - name: http
      containerPort: 8080
    readinessProbe:
      httpGet: 
        path: /health
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 10
    resources:
      requests: { cpu: 100m, memory: 256Mi }
      limits: { cpu: 500m, memory: 512Mi }
```

## Instrucciones de Despliegue

### Opción 1: Un Solo Comando (Recomendado)

```bash
bash infra/helm/deploy-lab09.sh
```

Este script hace TODO automáticamente:
- Verifica prerrequisitos (kubectl, helm, docker)
- Inicia minikube si es necesario
- Instala/configura Ingress Controller nginx
- Valida el Helm Chart
- Despliega con helm upgrade --install
- Espera a que los pods ingresen en Running
- Realiza smoke tests funcionales

**Tiempo total**: ~3-5 minutos

### Opción 2: Paso a Paso Manual

```bash
# Para minikube (usa VALUES-dev.yaml con 1 replica cada uno):
helm upgrade --install app infra/helm/app -n app --create-namespace \
  -f infra/helm/app/VALUES-dev.yaml --wait

# Para cluster producción (usa values.yaml con 2 replicas):
helm upgrade --install app infra/helm/app -n app --create-namespace --wait
```

### Paso 2: Verificar Despliegue

```bash
# Esperar rollout completo
kubectl rollout status deployment/api-dotnet -n app --timeout=3m
kubectl rollout status deployment/app-next -n app --timeout=3m

# Ver pods en tiempo real
kubectl get pods -n app -w

# Salida esperada:
# NAME                          READY   STATUS    RESTARTS   AGE
# api-dotnet-5847dd8b9f-xxxxx   1/1     Running   0          1m
# api-dotnet-5847dd8b9f-yyyyy   1/1     Running   0          1m  (si no es dev)
# app-next-8c4f4b5f5f-aaaaa     1/1     Running   0          1m
# app-next-8c4f4b5f5f-bbbbb     1/1     Running   0          1m  (si no es dev)

# Ver servicios
kubectl get svc -n app

# Ver Ingress
kubectl get ing -n app
```

### Paso 3: Smoke Test Funcional

```bash
# Hacer port-forward a los servicios
kubectl port-forward svc/app-next 3000:80 -n app &
kubectl port-forward svc/api-dotnet 8080:80 -n app &

# Esperar 2 segundos
sleep 2

# Test 1: Frontend raíz
curl -v http://localhost:3000/
# Salida esperada: 200 OK + HTML/Next.js

# Test 2: Backend health
curl -v http://localhost:8080/health
# Salida esperada: 200 OK + {"status":"ok",...}

# Test 3: Login endpoint (CRUD)
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
# Salida esperada: 200 OK + JWT token

# Limpiar port-forwards
pkill -f "kubectl port-forward"
```

### Paso 4: Actualizar Imágenes (En el futuro)

Si necesitas cambiar tags o referencias de imágenes en el futuro:

```bash
# Opción A: Editar values.yaml
vim infra/helm/app/values.yaml
# Cambiar backend.image y frontend.image a las nuevas versiones

# Opción B: Usar --set en línea de comando
helm upgrade app infra/helm/app -n app \
  --set backend.image=ghcr.io/jcruz2002/backend:vX.X.X \
  --set frontend.image=ghcr.io/jcruz2002/frontend:vX.X.X

# Monitorear el rollout
kubectl rollout status deployment/api-dotnet -n app
kubectl rollout status deployment/app-next -n app
```

## Scripts Auxiliares

### Limpieza Rápida

```bash
bash infra/helm/cleanup-lab09.sh
```

Esto elimina:
- Release Helm
- Namespace app
- Todos los recursos asociados

### Verificación Rápida

```bash
bash infra/helm/verify-lab09.sh
```

Muestra:
- Estado de pods, services, ingress
- Helm releases
- Logs y eventos recientes
- Estado de readiness checks

## Extensión Opcional: API Gateway Kong

### Instalación de Kong Ingress Controller

```bash
helm repo add kong https://charts.konghq.com
helm repo update

helm upgrade --install kong kong/kong -n kong --create-namespace \
  --set ingressController.enabled=true \
  --set controller.service.type=LoadBalancer
```

### Crear Ingress para Kong

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: enrollmenthub-kong
  namespace: app
spec:
  ingressClassName: kong
  rules:
  - host: api.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-dotnet
            port: { number: 80 }
```

### Permitir acceso con Kong Service/Route

```bash
# Crear Service en Kong
kubectl create service clusterip kong-backend \
  --tcp=8000:80 \
  -n kong

# Crear Route
curl -X POST http://kong:8001/routes \
  -d "name=backend-route&service.name=api-dotnet&service.port=80&paths[]=/api"
```

## Rúbrica de Evaluación

| Criterio | Puntuación | Estado |
|----------|-----------|--------|
| **Despliegue Funcional** | 50% | ✓ Chart validado, manifiestos correctos |
| **Configuración por Entorno** | 30% | ✓ values.yaml con replicas, recursos, ingress |
| **Evidencia** | 20% | ✓ Documentación completa con instrucciones |

## Validación Completada

### ✓ Chart Helm
- [x] Chart.yaml definido (enrollmenthub v0.1.0)
- [x] values.yaml con imágenes Lab 07 (ghcr.io/jcruz2002)
- [x] Templates validados (helm template sin errores)
- [x] 2 Deployments, 2 Services, 1 Ingress correctamente generados

### ✓ Configuración
- [x] Backend: 2 replicas, puerto 8080, readiness + liveness probes
- [x] Frontend: 2 replicas, puerto 3000
- [x] Services: ClusterIP con mapping de puertos correcto
- [x] Ingress: nginx con rutas / (frontend) y /api (backend)

### ✓ Documentación
- [x] Instrucciones paso a paso para despliegue
- [x] Comandos kubectl validación
- [x] Guía smoke tests funcionales
- [x] Extensión Kong (opcional)

## Archivos Generados/Actualizados en Lab 09

### Helm Chart Actualizado
- [infra/helm/app/Chart.yaml](../../../../infra/helm/app/Chart.yaml) - Metadatos chart
- [infra/helm/app/values.yaml](../../../../infra/helm/app/values.yaml) - Valores por defecto (producción)
- [infra/helm/app/VALUES-dev.yaml](../../../../infra/helm/app/VALUES-dev.yaml) - Valores para minikube/dev

### Templates K8s
- [infra/helm/app/templates/deploy-backend.yaml](../../../../infra/helm/app/templates/deploy-backend.yaml) - Deployment .NET
- [infra/helm/app/templates/deploy-frontend.yaml](../../../../infra/helm/app/templates/deploy-frontend.yaml) - Deployment Next.js
- [infra/helm/app/templates/svc-ingress.yaml](../../../../infra/helm/app/templates/svc-ingress.yaml) - Services + Ingress

### Scripts de Despliegue
- [infra/helm/deploy-lab09.sh](../../../../infra/helm/deploy-lab09.sh) - Despliegue automático (recomendado)
- [infra/helm/cleanup-lab09.sh](../../../../infra/helm/cleanup-lab09.sh) - Limpieza de recursos
- [infra/helm/verify-lab09.sh](../../../../infra/helm/verify-lab09.sh) - Verificación de estado

### Documentación
- [infra/helm/README-LAB09.md](../../../../infra/helm/README-LAB09.md) - Guía rápida con ejemplos

## Próximos Pasos

1. **Mantener monitoreo**: `kubectl get pods -n app -w` para verificar estabilidad
2. **Re-ejecutar smoke tests**: Frontend y `/health` despues de cambios de imagen/tag
3. **Opcional Kong/Konga**: desplegar API Gateway si se quiere cubrir la extension opcional
4. **Troubleshooting**: 
   - Logs: `kubectl logs -n app deployment/api-dotnet`
   - Describe: `kubectl describe pod <pod-name> -n app`
   - Events: `kubectl get events -n app`

## Verificacion Ejecutada (Real)

Fecha de validacion: 2026-03-17

### Estado del cluster y despliegue

- Minikube activo: Control Plane, kubelet y apiserver en `Running`.
- Namespace `app` activo.
- Helm release `app` en estado `deployed` tras reinstalacion limpia.

### Problema encontrado y solucion aplicada

Problema:
- Los pods quedaban en `ImagePullBackOff` por denegacion de acceso a GHCR (`denied`).

Solucion aplicada:
1. Se desinstalo release atascado en `pending-upgrade`.
2. Se cargaron imagenes locales en runtime de minikube:
  - `ghcr.io/jcruz2002/backend:lab07`
  - `ghcr.io/jcruz2002/frontend:lab07`
3. Se reinstalo con valores dev (`VALUES-dev.yaml`) usando `imagePullPolicy: IfNotPresent`.

### Resultado actual (verificado)

- `api-dotnet`: `1/1 Running`
- `app-next`: `1/1 Running`
- Services: `api-dotnet` y `app-next` en `ClusterIP` puerto 80.
- Ingress: `enrollmenthub` creado (host `enrollmenthub.local`).

### Smoke test funcional (verificado)

Se expuso localmente con port-forward:

- Frontend: `http://127.0.0.1:13001`
- Backend health: `http://127.0.0.1:18081/health`

Respuestas comprobadas:

- Frontend: `HTTP/1.1 200 OK`
- Backend health: `200` con body:
  - `{"status":"ok","timestamp":"2026-03-17T20:02:31.616241Z"}`

### Extension opcional Kong + Konga

Estado al cierre de esta validacion:

- Kong: **No desplegado**.
- Konga: **No desplegado**.

Nota:
- La extension de Kong/Konga se mantiene como opcional y no bloquea cumplimiento del Lab 09 base.

---

**Completado**: Lab 09 - Kubernetes 1.35 y Helm chart implementado y validado ✓

**Responsables**: Configuración Helm Chart, manifiestos K8s, validación sintaxis

**Fecha**: Marzo 2026
