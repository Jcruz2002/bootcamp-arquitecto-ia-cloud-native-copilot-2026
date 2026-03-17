# Lab 07 - Docker y publicación en GHCR

## Objetivo
Empaquetar servicios en imágenes y publicarlas en GitHub Container Registry.

## Prerrequisitos
- Backend y frontend funcionales.

## Paso a paso
1. Revisa o crea Dockerfiles.
2. Construye imagen local de backend y frontend.
3. Prueba ejecucion local en contenedor.
4. Etiqueta imágenes con version.
5. Publica en GHCR.

## Comandos sugeridos
```bash
docker build -t ghcr.io/<org>/backend:lab07 templates/dotnet10-api
docker build -t ghcr.io/<org>/frontend:lab07 templates/next16-app
docker push ghcr.io/<org>/backend:lab07
docker push ghcr.io/<org>/frontend:lab07
```

## Validación
- Imágenes publicadas y descargables.
- Contenedores levantan correctamente.

## Rúbrica
- 50% imágenes correctas.
- 30% versionado y trazabilidad.
- 20% evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con tags e imágenes publicadas.


