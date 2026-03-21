# Evidencia Lab 26 - Azure API Management

## Objetivo
Publicar una API existente en Azure API Management (APIM), aplicar policies de seguridad y rate limit, y validar respuestas 200, 401 y 429.

## Estado final
- Suscripcion Azure activa y valida.
- Resource Group: biblioteca-api (eastus).
- APIM: apimbiblioteca26.
- Provisioning final: Succeeded.
- API publicada en APIM: biblioteca-api.

## Configuracion aplicada
- API ID: biblioteca-api
- API Path: biblioteca-api
- Backend URL: https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net
- OpenAPI origen: https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net/swagger/v1/swagger.json

## Comandos ejecutados (resumen)
```bash
az apim show --name apimbiblioteca26 --resource-group biblioteca-api --query "{name:name, provisioningState:provisioningState, gatewayUrl:gatewayUrl, portalUrl:portalUrl}" -o json

bash labs/evidencias/lab-26-azure-apim/run-lab26-apim.sh

az apim api list --service-name apimbiblioteca26 --resource-group biblioteca-api --query "[].{name:name,displayName:displayName,path:path,serviceUrl:serviceUrl}" -o table

az rest --method put \
	--url "https://management.azure.com/subscriptions/533d0148-ac12-4365-8fe8-e934e0af81b8/resourceGroups/biblioteca-api/providers/Microsoft.ApiManagement/service/apimbiblioteca26/apis/biblioteca-api/policies/policy?api-version=2022-08-01" \
	--headers "Content-Type=application/vnd.ms-azure-apim.policy.raw+xml" "If-Match=*" \
	--body @"labs/evidencias/lab-26-azure-apim/policy-rate-limit-jwt-entra.xml" --output none
```

## Policies aplicadas
- Rate limit: 30 llamadas por 60 segundos.
- Validate JWT (Entra ID) en header Authorization.
- Propagacion de x-correlation-id.

Archivos policy usados:
- labs/evidencias/lab-26-azure-apim/policy-rate-limit.xml
- labs/evidencias/lab-26-azure-apim/policy-rate-limit-jwt-entra.xml

## Validaciones realizadas

### Prueba 200
- URL probada: https://apimbiblioteca26.azure-api.net/biblioteca-api/api/v1
- Resultado: 200 OK

### Prueba 429
- Prueba de burst de 40 llamadas sobre el mismo endpoint.
- Resultado observado: llamadas 1-29 con 200, desde la llamada 30 con 429.
- Mensaje recibido: Rate limit is exceeded.

### Prueba 401
- Con policy validate-jwt activa y sin token.
- Resultado: 401 Unauthorized.
- Mensaje recibido: Unauthorized. Access token is missing or invalid.

## URLs de verificacion
- APIM Gateway: https://apimbiblioteca26.azure-api.net
- API via APIM: https://apimbiblioteca26.azure-api.net/biblioteca-api/api/v1
- Azure Portal APIM: https://portal.azure.com/#@/resource/subscriptions/533d0148-ac12-4365-8fe8-e934e0af81b8/resourceGroups/biblioteca-api/providers/Microsoft.ApiManagement/service/apimbiblioteca26/overview
- Developer Portal correcto: https://apimbiblioteca26.developer.azure-api.net

Nota: la URL https://apimbiblioteca26.portal.azure-api.net puede responder 404 para navegacion directa segun configuracion del portal. La URL funcional para pruebas de portal en este entorno es developer.azure-api.net.

## Swagger y OpenAPI
- Swagger del backend (funciona): https://bibliotecaweb20260315233743-gkeqdzesceeaacbm.eastus-01.azurewebsites.net/swagger/index.html
- En APIM, la ruta /swagger no quedo expuesta como operacion publica en gateway, por eso devuelve 404.
- Se exporto OpenAPI de APIM para pruebas con Swagger:
	- labs/evidencias/lab-26-azure-apim/openapi-apim/biblioteca-api_openapi+json.json

## Evidencia de publicacion completada
La API biblioteca-api quedo publicada en Azure API Management apimbiblioteca26 con policies activas y validacion satisfactoria de escenarios 200, 429 y 401.
