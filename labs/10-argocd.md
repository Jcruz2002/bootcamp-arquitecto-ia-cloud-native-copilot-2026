# Lab 10 - GitOps con Argo CD

## Objetivo
Administrar despliegues declarativos sincronizados desde Git.

## Prerrequisitos
- Lab 09 completado.
- Argo CD disponible.

## Paso a paso
1. Crea recurso Application de Argo CD.
2. Apunta al repositorio y rama objetivo.
3. Habilita sync policy segun estrategia.
4. Verifica estado Synced y Healthy.
5. Prueba cambio Git y resincronizacion.

## Comandos sugeridos
```bash
git checkout -b lab-10
git commit -m "lab10: Kubernetes 1.35 y Helm"
git push origin lab-1o

## Validaci�n
- Argo CD refleja estado real del cluster.
- Cambios en Git generan despliegue esperado.

## R�brica
- 50% sincronizacion correcta.
- 30% control de cambios.
- 20% evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con estado Argo CD y despliegue.

