# Lab AZDO-03 - Build y push de imágenes a ACR

## Objetivo
Publicar imágenes de backend y frontend en Azure Container Registry.

## Prerrequisitos
- Lab AZDO-02 completado.
- ACR creado en Azure.
- Service connection a Azure configurada en Azure DevOps.

## Paso a paso
1. Crea o reutiliza pipeline de build de imágenes.
2. Configura tareas Docker:
   - build backend
   - build frontend
   - push a ACR
3. Define naming de tags:
   - `latest`
   - `build-<BuildId>`
   - opcional semántico
4. Publica metadatos de build.

## Validación
- Imágenes visibles en ACR.
- Tags correctos por build.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- Evidencia de repositorios en ACR.
- Evidencia de pipeline con push exitoso.
