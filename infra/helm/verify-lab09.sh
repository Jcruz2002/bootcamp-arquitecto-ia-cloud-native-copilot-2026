#!/bin/bash

# verify-lab09.sh
# Script para verificar estado del despliegue Lab 09

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Verificación Lab 09 ===${NC}\n"

# 1. Namespace
echo -e "${YELLOW}Namespaces:${NC}"
kubectl get ns | grep -E "^(NAME|app|ingress-nginx|kube)" || echo "No namespaces encontrados"
echo ""

# 2. Pods
echo -e "${YELLOW}Pods en namespace 'app':${NC}"
kubectl get pods -n app -o wide 2>/dev/null || echo "Namespace 'app' no existe aún"
echo ""

# 3. Services
echo -e "${YELLOW}Services en namespace 'app':${NC}"
kubectl get svc -n app 2>/dev/null || echo "Services no encontrados"
echo ""

# 4. Ingress
echo -e "${YELLOW}Ingress en namespace 'app':${NC}"
kubectl get ing -n app 2>/dev/null || echo "Ingress no encontrado"
echo ""

# 5. Helm Release
echo -e "${YELLOW}Helm Releases:${NC}"
helm list -n app 2>/dev/null || echo "Release no encontrada"
echo ""

# 6. Logs
echo -e "${YELLOW}Últimas líneas de logs (api-dotnet):${NC}"
kubectl logs -n app deployment/api-dotnet --tail=3 2>/dev/null | tail -3 || echo "Logs no disponibles"
echo ""

echo -e "${YELLOW}Últimas líneas de logs (app-next):${NC}"
kubectl logs -n app deployment/app-next --tail=3 2>/dev/null | tail -3 || echo "Logs no disponibles"
echo ""

# 7. Descripción
echo -e "${YELLOW}Resumen de eventos:${NC}"
kubectl get events -n app --sort-by='.lastTimestamp' 2>/dev/null | tail -5 || echo "Eventos no disponibles"
echo ""

# 8. Health checks
echo -e "${YELLOW}Verificación de readiness:${NC}"
if kubectl get pod -n app -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' 2>/dev/null | grep -q "True"; then
    echo -e "${GREEN}✓ Pods en estado Ready${NC}"
else
    echo -e "${RED}✗ Pods no están Ready aún${NC}"
fi
echo ""

echo -e "${GREEN}=== Verificación Completada ===${NC}"
