# Lab 10 - GitOps con Argo CD

## Objetivo
Administrar despliegues declarativos sincronizados desde Git para la aplicacion EnrollmentHub.

## Estado final del laboratorio

- Argo CD instalado en namespace `argocd`.
- Application `enrollmenthub` creada en Argo CD.
- Fuente Git configurada al repositorio real del curso.
- Rama objetivo configurada: `lab-10`.
- Estado final validado: `Synced` y `Healthy`.
- Prueba de cambio Git + resincronizacion automatica: **OK**.

## Implementacion realizada

### 1) Instalacion de Argo CD

Se instalo Argo CD con manifiesto oficial:

```bash
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Se detecto error de CRD por limite de annotations (applicationsets.argoproj.io), resuelto con server-side apply:

```bash
kubectl apply --server-side --force-conflicts -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 2) Configuracion de Application

Archivo usado:
- `infra/gitops/argocd/app.yaml`

Puntos claves de configuracion:
- `repoURL`: `https://github.com/Jcruz2002/bootcamp-arquitecto-ia-cloud-native-copilot-2026.git`
- `targetRevision`: `lab-10`
- `path`: `infra/helm/app`
- `destination.namespace`: `app`
- `syncPolicy.automated`: `prune=true`, `selfHeal=true`
- Helm parameters para entorno local/minikube:
  - backend/frontend image: `ghcr.io/jcruz2002/*:lab07`
  - `imagePullPolicy=IfNotPresent`
  - replicas backend/frontend en modo dev

Aplicacion:

```bash
kubectl apply -f infra/gitops/argocd/app.yaml
```

### 3) Validacion Synced / Healthy

Comando de verificacion:

```bash
kubectl get application enrollmenthub -n argocd -o jsonpath='sync={.status.sync.status} health={.status.health.status} rev={.status.sync.revision}{"\n"}'
```

Resultado verificado:

```text
sync=Synced health=Healthy rev=9903320b7634f1c7ff41fb23347429c7472543df
```

### 4) Prueba GitOps (cambio en Git -> despliegue)

Se realizaron commits reales en la rama `lab-10` para validar resincronizacion:

1. Commit de Application GitOps:
   - `9903320` - configurar Argo CD Application.

2. Commit de prueba GitOps en chart:
   - `8c52e78` - cambio en `infra/helm/app/templates/deploy-frontend.yaml` agregando label en pod template:
     - `gitops-change: lab10-resync-1`

Push ejecutado:

```bash
git push -u origin lab-10
```

y luego push de commits adicionales de prueba:

```bash
git push
```

### 5) Verificacion de resincronizacion automatica

Durante la prueba se observo:
- Cambio de revision Argo CD a commit nuevo (`8c52e78...`).
- Rollout automatico de frontend (nuevo ReplicaSet).
- Estado final nuevamente en `Synced` + `Healthy`.

Evidencia de rollout:

```text
sync=Synced health=Healthy rev=8c52e78a0a344d10c41ff847f890cb2137d914d6

ReplicaSets frontend:
- app-next-556568fd74  (nuevo, READY 1/1)
- app-next-97446cb6    (anterior, escalado a 0)

Pod frontend nuevo con label:
- gitops-change=lab10-resync-1
```

## Comandos de validacion usados

```bash
kubectl get pods -n argocd
kubectl get application enrollmenthub -n argocd
kubectl get deploy -n app
kubectl get rs -n app -l app=app-next
kubectl get pods -n app -l app=app-next --show-labels
```

## Resultado obtenido

- Argo CD refleja el estado real del cluster: **SI**.
- Cambios en Git generan despliegue esperado: **SI**.
- Auto-sync y self-heal funcionando: **SI**.

## Problemas y solucion

1. Error CRD `applicationsets.argoproj.io` con `metadata.annotations` demasiado largo.
   - Solucion: aplicar manifiesto Argo CD con `--server-side --force-conflicts`.

2. Estado `Progressing` inicial por reconciliaciones en curso.
   - Solucion: esperar reconciliacion completa y confirmar `Synced/Healthy` al revision final.

## Entregables

- Evidencia creada: `labs/evidencias/lab-10-argocd/lab-10-argocd.md`
- Configuracion Argo CD: `infra/gitops/argocd/app.yaml`
- Rama de trabajo publicada: `lab-10`
