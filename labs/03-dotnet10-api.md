# Lab 03 - .NET 10 API con EF Core y JWT

## Objetivo
Construir una API mínima con persistencia y autenticación.

## Prerrequisitos
- Labs 01 y 02 completados.
- PostgreSQL disponible.

## Paso a paso
1. Crea entidad User y endpoints CRUD.2. Configura DbContext y cadena de conexión.
3. Crea migración inicial y aplica base de datos.
4. Configura JwtBearer y un endpoint protegido.
5. Agrega pruebas unitarias mínimas.

## Comandos sugeridos
```bash
cd templates/dotnet10-api/src
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Microsoft.IdentityModel.Tokens
dotnet restore
dotnet build
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet test
```

## Validación
- CRUD operativo.
- Migración aplicada.
- Endpoint protegido responde 401/200 correctamente.

## Rúbrica
- 35% API funcional.
- 35% seguridad y persistencia.
- 30% pruebas y evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema y usa el tipo de archivo que aplique segun el lab (por ejemplo: .md, .pdf, .docx, imagenes o carpeta de capturas).

- EVIDENCIAS.md con pruebas y llamadas a endpoints.


