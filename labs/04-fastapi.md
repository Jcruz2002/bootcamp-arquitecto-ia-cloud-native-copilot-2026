# Lab 04 - FastAPI servicio productivo basico

## Objetivo
Implementar servicio FastAPI con contratos claros y pruebas b�sicas.

## Prerrequisitos
- Labs 01 y 02 completados.
- Python y entorno virtual listos.

## Paso a paso
1. Define modelos y rutas principales.
2. Implementa operaciones CRUD básicas.
3. Habilita documentacion OpenAPI.
4. Agrega validación y manejo de errores.
5. Crea pruebas de endpoints críticos.

## Comandos sugeridos
```bash
git checkout -b lab-04
cd templates/fastapi
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
pytest
git commit -m "lab04: flujo FastAPI servicio productivo basico"
git push origin lab04
```

## Validaci�n
- API responde segun contrato.
- Swagger/OpenAPI disponible.
- Pruebas basicas en verde.

## R�brica
- 40% funcionamiento.
- 30% calidad de contrato y errores.
- 30% pruebas y evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con capturas de OpenAPI y pruebas.

