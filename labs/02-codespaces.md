# Lab 02 - Codespaces y devcontainer reproducible

## Objetivo
Configurar un entorno cloud reproducible para desarrollar sin dependencias locales.

## Prerrequisitos
- Lab 00 completado.
- Repositorio en GitHub.

## Paso a paso
1. Crea un Codespace desde el repositorio.
2. Verifica herramientas base (git, node, python, dotnet, docker cli).
3. Ejecuta una app de plantilla para validar runtime.
4. Ajusta el devcontainer si falta una dependencia.
5. Documenta cambios del entorno.

## Comandos sugeridos
```bash
git --version
node --version
python --version
dotnet --version
git checkout -b lab-02
git add .
git commit -m "lab02: flujo Codespaces y devcontainer reproducible"
git push origin lab02
```


## Validaci�n
- El entorno inicia sin errores.
- Las herramientas requeridas estan disponibles.

## R�brica
- 50% entorno funcional.
- 30% reproducibilidad documentada.
- 20% evidencia técnica.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con verificacion de herramientas.

