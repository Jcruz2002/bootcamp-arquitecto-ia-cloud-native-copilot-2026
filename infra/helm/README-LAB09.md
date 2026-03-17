# Lab 09 - Deployment Automatizado

## Opción Rápida: Un Solo Comando

```bash
bash infra/helm/deploy-lab09.sh
```

Este script automatiza todos los pasos:
1. ✓ Verifica kubectl, helm, cluster K8s
2. ✓ Inicia minikube si es necesario
3. ✓ Instala/configura Ingress Controller (nginx)
4. ✓ Valida el Helm Chart
5. ✓ Crea namespace 'app'
6. ✓ Despliega el chart con helm upgrade --install
7. ✓ Espera rollout de pods
8. ✓ Realiza smoke tests

### Requisitos:
- kubectl ✓
- helm ✓
- docker ✓ (para minikube)
- minikube (opcional, se auto-inicia si no hay cluster)

### Resultado Final:
```
Pod api-dotnet (backend): Running
Pod app-next (frontend):  Running
Service app-next:  ClusterIP 80:3000
Service api-dotnet: ClusterIP 80:8080
Ingress enrollmenthub: enrollmenthub.local
```

---

## Opción Manual: Paso a Paso

Si prefieres controlar cada paso:

### 1. Iniciar minikube
```bash
minikube start --driver=docker --cpus=4 --memory=4096
```

### 2. Instalar ingress-nginx
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx --create-namespace \
  --set controller.service.type=LoadBalancer
```

### 3. Desplegar Helm Chart
```bash
# Para minikube (1 replica cada uno):
helm upgrade --install app infra/helm/app -n app --create-namespace \
  -f infra/helm/app/VALUES-dev.yaml

# O para cluster normal (2 replicas):
helm upgrade --install app infra/helm/app -n app --create-namespace
```

### 4. Verificar estado
```bash
# Esperar rollout
kubectl rollout status deployment/api-dotnet -n app
kubectl rollout status deployment/app-next -n app

# Ver pods
kubectl get pods -n app -w

# Ver servicios e ingress
kubectl get svc,ing -n app
```

### 5. Smoke Tests
```bash
# Port-forward para testing local
kubectl port-forward svc/app-next 3000:80 -n app &
kubectl port-forward svc/api-dotnet 8080:80 -n app &

# Test frontend
curl http://localhost:3000/

# Test backend health
curl http://localhost:8080/health

# Test CRUD (requiere JWT)
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

## Scripts Auxiliares

### Verificar estado rápido
```bash
bash infra/helm/verify-lab09.sh
```

Muestra:
- Namespaces, pods, services, ingress
- Helm releases
- Últimos logs
- Estado de readiness

### Limpiar despliegue
```bash
bash infra/helm/cleanup-lab09.sh
```

Elimina:
- Release Helm
- Namespace 'app'

---

## Troubleshooting

### Los pods no ingresan en Running
```bash
# Ver logs del pod
kubectl logs pod/api-dotnet-XXXXX -n app

# Ver eventos del namespace
kubectl get events -n app --sort-by='.lastTimestamp'

# Describir pod para más detalles
kubectl describe pod/api-dotnet-XXXXX -n app
```

### Las imágenes no se descargan
```bash
# Verificar si las imágenes existen en GHCR
docker pull ghcr.io/jcruz2002/backend:lab07
docker pull ghcr.io/jcruz2002/frontend:lab07

# Si falla, es necesario construirlas primero (ver Lab 07-08)
```

### El Ingress no tiene IP asignada
```bash
# En minikube:
minikube service -n app enrollmenthub  # Abre en navegador

# En cluster cloud (AWS/GCP/Azure):
kubectl get ing -n app -o wide  # Esperar a que EXTERNAL-IP se llene
```

### Port-forward no funciona
```bash
# Matar procesos anteriores
pkill -f "kubectl port-forward"

# Reintentar
kubectl port-forward svc/app-next 3000:80 -n app
```

---

## Flujo Completo Recomendado

Para garantizar que todo funcione:

```bash
# 1. Validar chart sin desplegar
helm template app infra/helm/app -n app > /tmp/manifest.yaml
kubectl apply -f /tmp/manifest.yaml --dry-run=client

# 2. Desplegar
bash infra/helm/deploy-lab09.sh

# 3. Verificar
bash infra/helm/verify-lab09.sh

# 4. Monitorear
watch kubectl get pods -n app

# 5. Testing completo
kubectl exec -it pod/app-next-XXXXX -n app -- bash
curl http://api-dotnet.app.svc.cluster.local:80/health
```

---

## Archivos Relevantes

| Archivo | Propósito |
|---------|-----------|
| `infra/helm/app/Chart.yaml` | Metadatos del Helm chart |
| `infra/helm/app/values.yaml` | Valores por defecto (2 replicas) |
| `infra/helm/app/VALUES-dev.yaml` | Valores para minikube (1 replica) |
| `infra/helm/app/templates/deploy-*.yaml` | Deployments |
| `infra/helm/app/templates/svc-ingress.yaml` | Services + Ingress |
| `infra/helm/deploy-lab09.sh` | Script despliegue automático |
| `infra/helm/cleanup-lab09.sh` | Script limpieza |
| `infra/helm/verify-lab09.sh` | Script verificación |

---

**Lab 09 Ready**: Todo configurado para despliegue con un solo comando ✓
