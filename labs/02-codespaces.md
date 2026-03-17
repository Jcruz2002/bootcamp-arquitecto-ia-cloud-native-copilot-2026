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
git commit -m "lab01: flujo copilot arquitectura c�digo pruebas"
```


## Validaci�n
- El entorno inicia sin errores.
- Las herramientas requeridas estan disponibles.

## R�brica
- 50% entorno funcional.
- 30% reproducibilidad documentada.
- 20% evidencia t�cnica.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema y usa el tipo de archivo que aplique segun el lab (por ejemplo: .md, .pdf, .docx, imagenes o carpeta de capturas).

- EVIDENCIAS.md con verificacion de herramientas.

