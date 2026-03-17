#!/bin/bash

# cleanup-lab09.sh
# Script para limpiar el despliegue de Lab 09

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Limpiando Lab 09 ===${NC}\n"

echo -e "${YELLOW}[1/3] Desintalando Helm Release...${NC}"
if helm list -n app | grep -q "^app"; then
    helm uninstall app -n app
    echo -e "${GREEN}✓ Release desintalado${NC}"
else
    echo -e "${YELLOW}ℹ Release no encontrado${NC}"
fi
echo ""

echo -e "${YELLOW}[2/3] Eliminando namespace 'app'...${NC}"
kubectl delete namespace app --ignore-not-found=true --wait=true
echo -e "${GREEN}✓ Namespace eliminado${NC}"
echo ""

echo -e "${YELLOW}[3/3] Estado final:${NC}"
kubectl get namespaces | grep -E "^(NAME|app)" || echo "Namespace 'app' eliminado"
echo ""

echo -e "${GREEN}=== Limpieza Completada ===${NC}"
