# Evidencia Lab 26 - Azure API Management

## Estado actual
- Suscripcion Azure activa y valida.
- Resource Group detectado: biblioteca-api (eastus).
- APIM creado: apimbiblioteca26.
- Estado actual APIM: Activating (provisionamiento en curso).

## Reintento adicional (20-03-2026)
- Se revalido estado con `az apim show` y `az resource show`.
- Resultado: `provisioningState=Activating` y `targetProvisioningState=Activating`.
- `gatewayUrl` y `portalUrl` aun null, por lo que Azure no permite todavia importar APIs ni aplicar policies.
- Se mantiene monitor en background y script idempotente para ejecutar importacion + policies + pruebas apenas cambie a `Succeeded`.

## Comandos ejecutados
```bash
az account show --output json
az group list --query "[].{name:name,location:location}" -o table
az apim check-name --name apimbiblioteca26 --output json
az provider register --namespace Microsoft.ApiManagement
az apim create --name apimbiblioteca26 --resource-group biblioteca-api --location eastus --publisher-email jdaviddelacruz@unicesar.edu.co --publisher-name Jdavid --sku-name Developer
```

## Backend candidato para importacion OpenAPI
- URL base: https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net
- OpenAPI: https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net/swagger/v1/swagger.json

## Automatizacion preparada
Se creo y ejecuto script idempotente para completar automaticamente cuando APIM pase a Succeeded:
- Import API en APIM.
- Desactivar subscription-required para pruebas directas.
- Aplicar policy rate-limit.
- Ejecutar prueba 200 y burst para 429.
- Aplicar policy validate-jwt + rate-limit.
- Ejecutar prueba 401 sin token.

Script:
- labs/evidencias/lab-26-azure-apim/run-lab26-apim.sh

Policies:
- labs/evidencias/lab-26-azure-apim/policy-rate-limit.xml
- labs/evidencias/lab-26-azure-apim/policy-rate-limit-jwt-entra.xml

## Proximo hito esperado
Cuando APIM cambie a Succeeded, el script dejara disponibles resultados de pruebas en:
- /tmp/l26_200_body.txt
- /tmp/l26_401_body.txt
- /tmp/l26_burst_codes.txt
