#!/bin/bash

# deploy-lab09.sh
# Script automatizado para desplegar Lab 09 en minikube o cluster K8s

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Lab 09: Kubernetes & Helm Deployment ===${NC}\n"

# 1. Verificar prerrequisitos
echo -e "${YELLOW}[1/8] Verificando prerrequisitos...${NC}"
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl no está instalado${NC}"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}helm no está instalado${NC}"; exit 1; }
echo -e "${GREEN}✓ kubectl y helm disponibles${NC}\n"

# 2. Verificar cluster
echo -e "${YELLOW}[2/8] Verificando cluster Kubernetes...${NC}"
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo -e "${YELLOW}No hay cluster activo. Iniciando minikube...${NC}"
    if command -v minikube >/dev/null 2>&1; then
        minikube start --driver=docker --cpus=4 --memory=4096
        echo -e "${GREEN}✓ Minikube iniciado${NC}"
    else
        echo -e "${RED}minikube no disponible y no hay cluster activo${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Cluster disponible${NC}\n"

# 3. Instalar Ingress Controller
echo -e "${YELLOW}[3/8] Configurando Ingress Controller (nginx)...${NC}"
if helm repo list | grep -q ingress-nginx; then
    echo "Repo ya existe, actualizando..."
    helm repo update ingress-nginx
else
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    helm repo update
fi

if ! kubectl get namespace ingress-nginx >/dev/null 2>&1; then
    echo "Instalando ingress-nginx..."
    helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
        -n ingress-nginx --create-namespace \
        --set controller.service.type=LoadBalancer \
        --wait --timeout=5m
    echo -e "${GREEN}✓ Ingress Controller instalado${NC}"
else
    echo -e "${GREEN}✓ Ingress Controller ya existe${NC}"
fi
echo ""

# 4. Validar Helm Chart
echo -e "${YELLOW}[4/8] Validando Helm Chart...${NC}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CHART_PATH="$REPO_ROOT/infra/helm/app"
helm template app "$CHART_PATH" -n app > /tmp/helm-manifest.yaml
RESOURCE_COUNT=$(grep -c "^kind:" /tmp/helm-manifest.yaml)
echo -e "${GREEN}✓ Chart validado ($RESOURCE_COUNT recursos generados)${NC}\n"

# 5. Crear namespace
echo -e "${YELLOW}[5/8] Creando namespace 'app'...${NC}"
kubectl create namespace app --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✓ Namespace 'app' listo${NC}\n"

# 6. Desplegar Helm Chart
echo -e "${YELLOW}[6/8] Desplegando Helm Chart...${NC}"

# Detectar valores apropiados
if command -v minikube >/dev/null 2>&1 && minikube status >/dev/null 2>&1; then
    echo "Usando valores para minikube (1 replica por despliegue)..."
    VALUES_FILE="$CHART_PATH/VALUES-dev.yaml"
    if [ -f "$VALUES_FILE" ]; then
        echo "  • Archivo: $VALUES_FILE"
        helm upgrade --install app "$CHART_PATH" -n app \
            -f "$VALUES_FILE" \
            --wait --timeout=5m
    else
        echo "  • Archivo de valores dev no encontrado, usando defaults..."
        helm upgrade --install app "$CHART_PATH" -n app --wait --timeout=5m
    fi
else
    echo "Usando valores defaults (2 replicas)..."
    helm upgrade --install app "$CHART_PATH" -n app --wait --timeout=5m
fi

echo -e "${GREEN}✓ Helm Chart desplegado${NC}\n"

# 7. Esperar a que los pods estén Ready
echo -e "${YELLOW}[7/8] Esperando a que los pods ingresen en Running...${NC}"
kubectl rollout status deployment/api-dotnet -n app --timeout=3m 2>&1 | tail -3
kubectl rollout status deployment/app-next -n app --timeout=3m 2>&1 | tail -3
echo -e "${GREEN}✓ Todos los pods en estado Running${NC}\n"

# 8. Mostrar endpoint y realizar smoke tests
echo -e "${YELLOW}[8/8] Verificación Final${NC}\n"

echo "Pods desplegados:"
kubectl get pods -n app -o wide
echo ""

echo "Services:"
kubectl get svc -n app
echo ""

echo "Ingress:"
kubectl get ing -n app
echo ""

# Obtener host
if command -v minikube >/dev/null 2>&1 && minikube status >/dev/null 2>&1; then
    INGRESS_IP=$(minikube ip)
    echo -e "${YELLOW}Agregando entrada a /etc/hosts:${NC}"
    echo "  $INGRESS_IP enrollmenthub.local"
    echo ""
    echo -e "${YELLOW}URLs accesibles:${NC}"
    echo "  Frontend: http://enrollmenthub.local/"
    echo "  Backend:  http://enrollmenthub.local/api/health"
    echo ""
    
    # Smoke test (si es posible)
    echo -e "${YELLOW}Realizando smoke tests...${NC}"
    sleep 5  # Esperar a que los pods se estabilicen
    
    # Port-forward para testing
    kubectl port-forward svc/app-next 3000:80 -n app &
    PF_PID=$!
    sleep 2
    
    echo "Test 1: Frontend root"
    if curl -s http://localhost:3000 | grep -q "Next.js\|html"; then
        echo -e "${GREEN}✓ Frontend respondiendo${NC}"
    else
        echo -e "${RED}✗ Frontend no respondiendo${NC}"
    fi
    
    kubectl port-forward svc/api-dotnet 8080:80 -n app &
    PF_PID2=$!
    sleep 2
    
    echo "Test 2: Backend health"
    if curl -s http://localhost:8080/health | grep -q "ok\|running"; then
        echo -e "${GREEN}✓ Backend respondiendo${NC}"
    else
        echo -e "${YELLOW}ℹ Backend salud: $(curl -s http://localhost:8080/health 2>&1 | head -1)${NC}"
    fi
    
    kill $PF_PID $PF_PID2 2>/dev/null || true
else
    echo -e "${YELLOW}Entorno: Cluster Kubernetes (no minikube)${NC}"
    echo "Obtén el Ingress IP/DNS desde: kubectl get ing -n app"
fi

echo ""
echo -e "${GREEN}=== Lab 09 Despliegue Completado ===${NC}"
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  • Monitorear pods: kubectl logs -f deployment/api-dotnet -n app"
echo "  • Ver eventos: kubectl get events -n app"
echo "  • Limpiar: helm uninstall app -n app && kubectl delete namespace app"
