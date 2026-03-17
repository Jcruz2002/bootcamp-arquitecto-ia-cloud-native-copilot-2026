# Lab 08 - GitHub Actions CI/CD

## Objetivo
Automatizar build, pruebas y publicacion de imagenes.

## Prerrequisitos
- Lab 07 completado.

## Paso a paso
1. Configura workflow de CI para build y test.
2. Configura workflow de release para GHCR.
3. Define secrets y variables de entorno.
4. Agrega protecciones minimas de rama.
5. Ejecuta pipeline en pull request y en main.

## Comandos sugeridos
```bash
git checkout -b lab-08
git commit -m "lab08: GitHub Actions CI/CD"
git push origin lab-08

## Validaci�n
- CI en verde en PR.
- Release publica im�genes correctamente.

## R�brica
- 40% pipeline CI.
- 40% pipeline release.
- 20% evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con links a ejecuciones.


