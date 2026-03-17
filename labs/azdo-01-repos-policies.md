# Lab AZDO-01 - Azure Repos, ramas y políticas

## Objetivo
Configurar repositorio, flujo de ramas y políticas de PR en Azure DevOps.

## Prerrequisitos
- Cuenta de Azure y acceso a Azure DevOps.
- Proyecto del bootcamp existente o nuevo.

## Paso a paso
1. Crea un proyecto en Azure DevOps.
2. Importa el repositorio del bootcamp.
3. Define ramas `main`, `develop`, `feature/*`.
4. Configura branch policies en `main`:
   - mínimo 1 aprobador
   - build validation obligatoria
   - comentarios resueltos antes de merge
5. Crea primer PR de prueba y valida políticas.

## Validación
- PR no puede fusionar sin cumplir políticas.
- Historial de revisión queda registrado.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- Capturas de policies.
- URL de PR de validación.
