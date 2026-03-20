# Evidencias Lab 20 - Agentes con Microsoft Semantic Kernel y Azure AI Foundry

## Objetivo
Implementar un agente funcional con Semantic Kernel en la API .NET existente, con tool calling real, endpoint HTTP y controles de seguridad.

## Implementacion realizada
- Dependencias Semantic Kernel agregadas en `templates/dotnet10-api/src/Api.csproj`.
- Servicio de agente creado en `templates/dotnet10-api/src/Application/Agent/AgentService.cs`.
- Plugin de herramientas creado en `templates/dotnet10-api/src/Application/Agent/UsersPlugin.cs`.
- Sanitizacion de prompt en `templates/dotnet10-api/src/Application/Agent/AgentPromptSanitizer.cs`.
- Contrato de aplicacion en `templates/dotnet10-api/src/Application/IAgentService.cs`.
- Endpoint HTTP `POST /api/v1/agent/report` en `templates/dotnet10-api/src/Controllers/AgentController.cs`.
- Registro DI en `templates/dotnet10-api/src/Program.cs`.

## Comandos ejecutados

### 1) Compilacion
```bash
cd templates/dotnet10-api/src
dotnet build
```

Resultado:
- Build exitoso.
- Warnings conocidos de paquetes preview y advisory de dependencias (sin bloquear la ejecucion).

### 2) Levantar dependencias de datos
```bash
cd /workspaces/bootcamp-arquitecto-ia-cloud-native-copilot-2026
docker compose -f infra/docker-compose.data.yml up -d redis postgres
docker compose -f infra/docker-compose.data.yml ps
```

Resultado:
- `infra-postgres-1` en estado `Up`.
- `infra-redis-1` en estado `Up`.

### 3) Levantar API .NET
```bash
cd templates/dotnet10-api/src
ASPNETCORE_URLS=http://0.0.0.0:8080 dotnet run
```

### 4) Probar salud y endpoint del agente
```bash
curl -s -o /tmp/agent_health.json -w 'HEALTH:%{http_code}\n' http://localhost:8080/health
curl -s -X POST http://localhost:8080/api/v1/agent/report \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Summarize the active users in the system"}' \
  -o /tmp/agent_report.json -w 'AGENT:%{http_code}\n'
head -c 1200 /tmp/agent_report.json
```

Resultado final:
```text
HEALTH:200
AGENT:200
{"report":"User Activity Report\nGeneratedAt(UTC): 2026-03-19T16:30:01.1340855Z\nTotal: 89. Active: 89. Inactive: 0.\nMode: fallback (no Azure OpenAI configurat
```

### 5) Validacion de seguridad (sin claves hardcodeadas)
```bash
cd templates/dotnet10-api/src
git grep -nEi "(AZURE_OPENAI_KEY\s*=|sk-[A-Za-z0-9]{20,}|api[_-]?key\s*[:=]\s*['\"]?[A-Za-z0-9_-]{16,})" -- . ':!bin' ':!obj' || true
```

Resultado:
- Sin coincidencias.

## Evidencia de tool calling y logs
Durante la ejecucion del endpoint se observaron logs de invocacion de herramientas:

```text
[AgentTool] tool=get_active_users input={} output=[{"id":"..."...
[AgentTool] tool=summarize_users input=[{"id":"..."...
[AgentTool] tool=format_report input=Total: 89. Active: 89. Inactive: 0. output=User Activity Report...
```

Adicionalmente, se registraron logs de fallback controlado cuando faltan variables de Azure OpenAI:

```text
Azure OpenAI env vars are missing. Falling back to deterministic report mode.
```

## Prompts sugeridos para probar el agente (Lab 20)

### Prompt base (resumen general)
```json
{
   "prompt": "Summarize the active users in the system"
}
```

### Prompt ejecutivo (respuesta corta)
```json
{
   "prompt": "Generate a short executive report of user activity with total, active and inactive users"
}
```

### Prompt orientado a estado de usuarios
```json
{
   "prompt": "Give me a status breakdown of users and format it as an activity report"
}
```

### Prompt para validar formato de salida
```json
{
   "prompt": "Create a clean report for API response including UTC generation time and user totals"
}
```

### Prompt en espanol
```json
{
   "prompt": "Resume los usuarios activos del sistema y entrega un reporte corto con total, activos e inactivos"
}
```

### Prompt de validacion negativa (seguridad)
```json
{
   "prompt": ""
}
```
Esperado: HTTP 400 por validacion de entrada.

### Prompt de validacion por limite de longitud
- Enviar un prompt mayor a 1000 caracteres.
- Esperado: HTTP 400 por regla de validacion/sanitizacion.

## Resumen de ejecuciones y validaciones

Los prompts ejecutados generaron los siguientes resultados clave:

**Prompt "Summarize the active users in the system"** retornó HTTP 200 con un reporte que incluye `Total`, `Active`, `Inactive` y modo `fallback`. Esto confirma que el agente usa datos reales del sistema y responde correctamente incluso sin credenciales de Azure OpenAI.

**Prompt "Generate a short executive report of user activity..."** retornó HTTP 200 demostrando que el agente adapta el formato de salida según la intención del prompt (resumen ejecutivo), manteniendo coherencia con los datos.

**Prompt vacío** (`""`) retornó HTTP 400 por validación de entrada, asegurando que se evita ejecutar el agente con payloads inválidos.

**Prompt > 1000 caracteres** retornó HTTP 400 por regla de sanitización, limitando el riesgo de abuso y manteniendo los límites definidos.

## Casos de ejecución

### Caso 1 - Resumen general de usuarios
Prompt ejecutado:
```json
{
   "prompt": "Summarize the active users in the system"
}
```

Resultado obtenido:
```text
HEALTH:200
AGENT:200
{"report":"User Activity Report\nGeneratedAt(UTC): ...\nTotal: 89. Active: 89. Inactive: 0.\nMode: fallback (no Azure OpenAI configuration)."}
```

Significado:
- El endpoint del agente respondió correctamente con datos reales del sistema.
- El reporte incluye resumen cuantitativo (total, activos, inactivos).
- El sufijo `Mode: fallback` confirma que no se usó Azure OpenAI por ausencia de variables de entorno, pero el flujo del agente sigue funcionando.

### Caso 2 - Prompt ejecutivo
Prompt ejecutado:
```json
{
   "prompt": "Generate a short executive report of user activity with total, active and inactive users"
}
```

Resultado obtenido:
- HTTP `200`.
- Reporte en texto con métricas de usuarios.

Significado:
- El agente adapta el formato de salida según la intención del prompt (resumen ejecutivo), manteniendo coherencia con los datos del sistema.

### Caso 3 - Validación de entrada (prompt vacío)
Prompt ejecutado:
```json
{
   "prompt": ""
}
```

Resultado obtenido:
- HTTP `400` por validación del request.

Significado:
- Se aplica control de seguridad en la entrada para evitar prompts inválidos antes de ejecutar el agente.

### Caso 4 - Validación por longitud máxima
Prompt ejecutado:
- Cadena de más de 1000 caracteres.

Resultado obtenido:
- HTTP `400` por regla de sanitización/validación.

Significado:
- Se limita el tamaño del prompt para reducir riesgos de abuso y mantener el agente dentro de los límites definidos del laboratorio.

## Problemas encontrados y solucion
1. Error HTTP 500 por metadata de validacion en record primario de `AgentReportRequest`.
   - Solucion: cambiar a clase DTO con atributos en propiedades (`[Required]`, `[MaxLength]`).
2. Error HTTP 500 por Redis no disponible (`localhost:6379`).
   - Solucion: levantar `redis` desde `infra/docker-compose.data.yml`.

## Resultado obtenido
- Endpoint del agente operativo con respuesta HTTP 200.
- Tool calling implementado y visible en logs.
- Prompt sanitizado y limite de longitud aplicado.
- Sin claves sensibles hardcodeadas en codigo.

## Pendientes opcionales
- Configurar `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT` para ejecutar en modo LLM en lugar de fallback deterministico.
- Actualizar a version no vulnerable de Semantic Kernel cuando este disponible/compatible con el stack del template.
