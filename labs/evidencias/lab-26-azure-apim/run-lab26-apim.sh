#!/usr/bin/env bash
set -euo pipefail

SUB_ID="533d0148-ac12-4365-8fe8-e934e0af81b8"
RG="biblioteca-api"
APIM="apimbiblioteca26"
API_ID="biblioteca-api"
API_PATH="biblioteca-api"
SPEC_URL="https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net/swagger/v1/swagger.json"
BACKEND_URL="https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net"
EVID_DIR="/workspaces/bootcamp-arquitecto-ia-cloud-native-copilot-2026/labs/evidencias/lab-26-azure-apim"
RATE_POLICY="$EVID_DIR/policy-rate-limit.xml"
JWT_POLICY="$EVID_DIR/policy-rate-limit-jwt-entra.xml"

for i in $(seq 1 180); do
  STATE=$(az apim show --name "$APIM" --resource-group "$RG" --query provisioningState -o tsv)
  echo "[$i] APIM state: $STATE"
  if [[ "$STATE" == "Succeeded" ]]; then
    break
  fi
  sleep 15
done

STATE=$(az apim show --name "$APIM" --resource-group "$RG" --query provisioningState -o tsv)
if [[ "$STATE" != "Succeeded" ]]; then
  echo "APIM no llego a Succeeded. Estado final: $STATE"
  exit 1
fi

az apim api import \
  --resource-group "$RG" \
  --service-name "$APIM" \
  --path "$API_PATH" \
  --api-id "$API_ID" \
  --display-name "Biblioteca API" \
  --service-url "$BACKEND_URL" \
  --specification-format OpenApiJson \
  --specification-url "$SPEC_URL" \
  --protocols https

az apim api update \
  --resource-group "$RG" \
  --service-name "$APIM" \
  --api-id "$API_ID" \
  --subscription-required false

az rest \
  --method put \
  --url "https://management.azure.com/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.ApiManagement/service/$APIM/apis/$API_ID/policies/policy?api-version=2022-08-01" \
  --headers "Content-Type=application/vnd.ms-azure-apim.policy.raw+xml" \
  --body @"$RATE_POLICY" \
  --output none

GATEWAY=$(az apim show --name "$APIM" --resource-group "$RG" --query gatewayUrl -o tsv)
TEST_URL="$GATEWAY/$API_PATH/api/v1"

echo "Gateway: $GATEWAY"
echo "Test URL: $TEST_URL"

echo "\nPrueba 200 (sin JWT, solo rate-limit):"
curl -sS -o /tmp/l26_200_body.txt -w "%{http_code}\n" "$TEST_URL"

echo "\nPrueba 429 (burst de 40 llamadas):"
for i in $(seq 1 40); do
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$TEST_URL")
  echo "call-$i:$code"
done | tee /tmp/l26_burst_codes.txt

echo "\nAplicando policy con validate-jwt para prueba 401..."
az rest \
  --method put \
  --url "https://management.azure.com/subscriptions/$SUB_ID/resourceGroups/$RG/providers/Microsoft.ApiManagement/service/$APIM/apis/$API_ID/policies/policy?api-version=2022-08-01" \
  --headers "Content-Type=application/vnd.ms-azure-apim.policy.raw+xml" \
  --body @"$JWT_POLICY" \
  --output none

echo "\nPrueba 401 sin token:"
curl -sS -o /tmp/l26_401_body.txt -w "%{http_code}\n" "$TEST_URL"

echo "\nLab 26 automatizado completado (import, policy, pruebas)."
