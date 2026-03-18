# Lab 13 - EF Core migrations y seed

## Objetivo
Gestionar evolutivo de esquema y datos semilla en .NET.

## Prerrequisitos
- Lab 03 completado.

## Paso a paso
1. Define modelos iniciales.
2. Genera migraci�n base.
3. Aplica base de datos.
4. Implementa seed idempotente.
5. Crea segunda migraci�n con cambio controlado.

## Comandos sugeridos
```bash
cd templates/dotnet10-api/src
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet ef migrations add AddEnrollmentStatus
dotnet ef database update
git checkout -b lab-13
git commit -m "lab13: Flujo EF Core migrations y seed"
git push origin lab-13
```

## Validaci�n
- Historial de migraciones consistente.
- Seed aplicado sin duplicados.

## R�brica
- 50% migraciones.
- 30% calidad de seed.
- 20% evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con migraciones aplicadas.


