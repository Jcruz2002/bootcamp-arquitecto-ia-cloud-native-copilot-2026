# Lab AZDO-04 - CD a Kubernetes con aprobaciones

## Objetivo
Desplegar en Kubernetes desde Azure Pipelines con gates por ambiente.

## Prerrequisitos
- Lab AZDO-03 completado.
- Cluster Kubernetes accesible.
- Helm chart disponible en `infra/helm`.

## Paso a paso
1. Crea pipeline de release/deploy con stages:
   - dev
   - stage
   - prod
2. Configura approvals manuales para stage y prod.
3. Despliega con Helm usando tag de imagen del build.
4. Publica estado del release.

## Validación
- Deploy automático en dev.
- Deploy bloqueado en stage/prod hasta aprobación.
- Pods saludables post-deploy.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- Capturas de aprobaciones.
- Evidencia de rollout por ambiente.
