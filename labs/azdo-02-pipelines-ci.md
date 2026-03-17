# Lab AZDO-02 - Azure Pipelines CI (build y test)

## Objetivo
Crear pipeline de integración continua para backend y frontend.

## Prerrequisitos
- Lab AZDO-01 completado.
- Agente Microsoft-hosted habilitado.

## Paso a paso
1. Crea archivo `azure-pipelines-ci.yml` en el repo.
2. Configura stages/jobs para:
   - restaurar dependencias
   - build .NET
   - test .NET
   - build frontend
   - test frontend
3. Configura triggers para `main` y `develop`.
4. Habilita status check obligatorio en PR.

## Validación
- Pipeline ejecuta en PR y en merge.
- Fallos de test bloquean integración.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- YAML del pipeline.
- Evidencia de corrida exitosa y fallida controlada.
