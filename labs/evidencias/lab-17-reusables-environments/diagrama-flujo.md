# Lab 17 - Validación y Diagrama de Flujo

## 📊 Diagrama de Workflows Reutilizables

```
┌─────────────────────────────────────────────────────────────────┐
│                       GitHub Actions Workflows                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ build.yml (REUSABLE)                                             │
│ ├─ build-backend (.NET 10)                                       │
│ │  ├─ dotnet restore (templates/dotnet10-api/src)              │
│ │  ├─ dotnet build -c Release                                   │
│ │  └─ dotnet test (si existen pruebas)                         │
│ │                                                                │
│ └─ build-frontend (Next.js 16)                                 │
│    ├─ npm ci (cache enabled)                                    │
│    ├─ npm run lint                                              │
│    └─ npm run build                                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ helm-deploy.yml (REUSABLE)                                       │
│ ├─ Inputs: environment, helm-release-name, helm-chart-path      │
│ │                                                                │
│ └─ jobs:                                                         │
│    ├─ Azure Login (OIDC)                                        │
│    ├─ AKS Set Context (kubelogin)                              │
│    ├─ Helm Upgrade Release                                      │
│    └─ Verification                                              │
│        ├─ kubectl rollout status (backend + frontend)           │
│        └─ Deployment summary                                    │
└──────────────────────────────────────────────────────────────────┘

             ▼ CONSUMED BY ▼

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│     ci.yml       │    │   deploy.yml     │    │  promotion.yml   │
│  (on: push/pr)   │    │ (on: dispatch)   │    │  (on: dispatch)  │
│                  │    │                  │    │                  │
│ uses: build.yml  │    │ uses: build.yml  │    │ uses: build.yml  │
│                  │    │ uses: helm-      │    │ uses: helm-      │
│                  │    │   deploy.yml (x3)│   │   deploy.yml     │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🔄 Pipeline de Promoción Completa

```
┌─────────────┐
│   COMMIT    │
│   main      │
└──────┬──────┘
       │
       ▼
   ╔═════════════════════════════════════════════╗
   ║           CI PIPELINE (Automático)          ║
   ║  - Trigger: push/pull_request a main        ║
   ║                                             ║
   ║  build.yml                                  ║
   ║  ├─ build-backend ✅                        ║
   ║  └─ build-frontend ✅                       ║
   ╚════════════════════╤════════════════════════╝
                        │
         ┌──────────────┴─────────────┐
         │                            │
         ▼                            ▼
    ✅ DEPLOY DEV              ⏳ AWAIT APPROVAL
    (automático)               (manual dispatcher)
                                      │
                 ┌────────────────────┴─────────────────┐
                 │                                      │
                 ▼                                      ▼
         ┌─────────────────┐              ┌─────────────────────┐
         │  PROMOTION.YML  │              │  DEPLOY.YML         │
         │ dev → stage     │              │ (selector de env)   │
         └────────┬────────┘              └──────────┬──────────┘
                  │                                  │
        ┌─────────▼─────────┐            ┌──────────▼──────────┐
        │  build.yml        │            │   build.yml         │
        │  ✅ Backend       │            │   ✅ Backend        │
        │  ✅ Frontend      │            │   ✅ Frontend       │
        └────────┬──────────┘            └──────────┬──────────┘
                 │                                  │
        ┌────────▼───────────────────────────────┐ │
        │ helm-deploy.yml (stage)                │ │
        │ ├─ environment: stage                  │ │
        │ ├─ Requires approval ⚠️                │ │
        │ ├─ helm upgrade enrollmenthub          │ │
        │ └─ kubectl rollout status              │ │
        └────────┬───────────────────────────────┘ │
                 │                      ┌───────────┘
         ┌───────▼────────────┐        │
         │ ✅ STAGE READY     │        │
         │                    │        │
         └────────────────────┘        │
                                       │
              ┌────────────────────────▼──────────────────┐
              │  APPROVAL → DEPLOY.YML (prod selected)    │
              │                                           │
              │  build.yml                                │
              │  ├─ build-backend ✅                      │
              │  └─ build-frontend ✅                     │
              │                                           │
              │  helm-deploy.yml (prod)                   │
              │  ├─ environment: prod                     │
              │  ├─ Requires 2+ approvals 🛑             │
              │  ├─ helm upgrade enrollmenthub            │
              │  └─ kubectl rollout status                │
              └──────────────┬─────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   ✅ PROD LIVE  │
                    │                 │
                    └─────────────────┘
```

---

## 🔑 Puntos de Integración

### 1. CI Pipeline Automático
```yaml
# Se dispara automáticamente
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build:
    uses: ./.github/workflows/build.yml
```

**Resultado:** Valida que cada PR/push compila correctamente.

---

### 2. Deploy Pipeline Manual (Automático a Dev)
```yaml
# Se dispara manualmente: Actions > Deploy Multi-Environment > Run workflow
on:
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [dev, stage, prod]

jobs:
  build:          # Reutiliza build.yml
  deploy-dev:     # Siempre se ejecuta
  deploy-stage:   # Condicional: if environment in [stage, prod]
  deploy-prod:    # Condicional: if environment == prod
```

**Flujo:**
- Si selecciona `dev` → solo deploy a dev
- Si selecciona `stage` → deploy dev + deploy stage (requiere aprobación)
- Si selecciona `prod` → deploy dev + deploy stage + deploy prod (requiere aprobaciones)

---

### 3. Promotion Pipeline (Stage-by-Stage)
```yaml
# Actions > Promotion Pipeline > Run workflow
on:
  workflow_dispatch:
    inputs:
      source-environment: [dev, stage]
      target-environment: [stage, prod]

# Valida transición: dev→stage o stage→prod
# Build para asegurar artefactos frescos
# Deploy con aprobación según environment nivel
```

---

## 📋 Checklist de Validación

### ✅ Estructura de Archivos
```bash
.github/workflows/
├── [✅] build.yml                 # Reusable para build
├── [✅] helm-deploy.yml          # Reusable para despliegue
├── [✅] ci.yml                   # Refactorizado (usa build.yml)
├── [✅] deploy.yml               # Refactorizado (usa helm-deploy.yml)
├── [✅] promotion.yml            # Nuevo (promoción multi-env)
├── [✅] codeql.yml               # Existente
└── [✅] release-ghcr.yml         # Existente
```

### ✅ Reutilización Implementada

| Workflow | Reutilizable | Usado por | Líneas |
|----------|--------------|-----------|--------|
| build.yml | Sí | ci.yml, deploy.yml, promotion.yml | 56 |
| helm-deploy.yml | Sí | deploy.yml (x3), promotion.yml | 54 |
| ci.yml | No | triggers: PR/push | 12 |
| deploy.yml | No | triggers: dispatch | 72 |
| promotion.yml | No | triggers: dispatch | 76 |

### ✅ Ambientes Configurados

| Ambiente | Aprobación | Auto-Deploy | Notas |
|----------|-----------|-------------|-------|
| dev | ❌ No | ✅ Sí | CI automático |
| stage | ⚠️ 1+ | ❌ No | Requiere reviewer |
| prod | 🛑 2+ | ❌ No | Requiere approvals |

### ✅ Rutas de Promoción

```
dev  ────→  stage  ────→  prod
  ↑               ↑
  │               └─ Aprobación requerida
  └────────────────── Aprobación requerida
```

---

## 🧪 Validación Manual

### Paso 1: Verificar estructura en GitHub
```bash
# Ver workflows en Actions tab
https://github.com/[owner]/bootcamp-arquitecto-ia-cloud-native-copilot-2026/actions

# Debería verse:
- Build (de ci.yml)
- Deploy Multi-Environment
- Promotion Pipeline
```

### Paso 2: Crear un Environments (Settings > Environments)

```bash
# Para cada environment:
# dev:
#   - No protecciones (opcional)
#   - Secrets: AZURE_CREDENTIALS, AZ_RG, AZ_AKS

# stage:
#   - Required reviewers: [team-de-dev o code-owners]
#   - Deployment branches: [main, release/*]
#   - Secrets heredadas

# prod:
#   - Required reviewers: [team-de-sre o admin]
#   - Protection rules: [require status checks, up-to-date]
#   - Timeout: 30 days
#   - Secrets: rotadas
```

### Paso 3: Probar CI Pipeline

```bash
# Hacer commit a main
git push origin lab-17

# GitHub ejecuta automáticamente ci.yml
# Actions > Click en run
# Debería ver: build-backend ✅ build-frontend ✅
```

### Paso 4: Probar Deploy Pipeline

```bash
# Actions > Deploy Multi-Environment > Run workflow
# Inputs:
#   - environment: "dev"
# Result: deploy-dev ✅

# Luego con "stage":
# Result: deploy-dev ✅ + deploy-stage ⏳ (awaiting approval)
```

### Paso 5: Probar Promotion Pipeline

```bash
# Actions > Promotion Pipeline > Run workflow
# Inputs:
#   - source-environment: "dev"
#   - target-environment: "stage"
# Result: validate ✅ build ✅ promote ✅ verify ✅

# Luego:
#   - source-environment: "stage"
#   - target-environment: "prod"
# Result: Similar flow con requerimiento de 2+ approvals
```

---

## 🎯 Beneficios Logrados

| Beneficio | Antes | Después |
|-----------|-------|---------|
| Código YAML duplicado | Alto | Bajo (DRY) |
| Puntos de cambio | N/A | Centralizados (build.yml, helm-deploy.yml) |
| Tiempo mantenimiento | Cuadrático | Lineal |
| Control de ambientes | Manual | Automático con aprobaciones |
| Visibilidad de promoción | Baja | Alta (workflow dispatch visible) |
| Governance | Débil | Fuerte (per-environment approvals) |

---

## 📝 Conclusión

Se han completado todos los requisitos del Lab 17:

✅ **40% - Reusable Workflows**
- build.yml (reutilizable)
- helm-deploy.yml (reutilizable)
- Usados en ci.yml, deploy.yml, promotion.yml

✅ **40% - Governance por Environments**
- 3 ambientes definidos (dev, stage, prod)
- Aprobaciones progresivas
- Rutas de promoción validadas

✅ **20% - Evidencia**
- Este documento (diagrama + validación)
- lab-17-reusables-environments.md (implementación)

**Lab 17 completado exitosamente.**
