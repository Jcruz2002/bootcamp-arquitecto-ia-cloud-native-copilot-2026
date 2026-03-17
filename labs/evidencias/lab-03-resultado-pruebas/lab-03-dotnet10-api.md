# Evidencias Lab 03 - .NET 10 API con EF Core y JWT

## Objetivo
Construir una API mínima con persistencia y autenticación.

## Estatus
✅ **COMPLETADO** - Pasos 1-4 implementados y compilados exitosamente.

---

## Paso 1: Entidad User y Endpoints CRUD
**Estado:** ✅ COMPLETADO

### Estructura de carpetas (Arquitectura por capas)
```
src/
├── Domain/
│   └── User.cs                      # Entidad de dominio
├── Application/
│   ├── IUserService.cs              # Interfaz de casos de uso
│   ├── UserService.cs               # Lógica de negocio
│   └── IUserRepository.cs           # Contrato de persistencia
├── Infrastructure/
│   ├── AppDb.cs                     # DbContext con EF Core
│   └── UserRepository.cs            # Implementación con PostgreSQL
└── Controllers/
    ├── UsersController.cs           # Endpoints CRUD
    └── AuthController.cs            # Endpoints de autenticación
```

### Endpoints CRUD implementados
- `GET /api/v1/users` - Listar usuarios (paginado: skip, take)
- `GET /api/v1/users/{id}` - Obtener usuario por ID
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/{id}` - Actualizar usuario (campos opcionales)
- `DELETE /api/v1/users/{id}` - Eliminar usuario

### Validaciones aplicadas
- Email debe ser formato válido y único
- Nombre mínimo 3 caracteres
- Status solo permite "active" o "inactive"
- Paginación: máximo 100 registros por página

---

## Paso 2: DbContext + Cadena de conexión
**Estado:** ✅ COMPLETADO

### Configuración de Base de Datos
**Archivo:** `appsettings.json`
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=bootcamp_api;Username=postgres;Password=postgres"
}
```

### Mapeo de entidades (AppDb.cs)
- Tabla `Users` con columnas:
  - Id (GUID, clave primaria)
  - Name (VARCHAR 255, requerido)
  - Email (VARCHAR 255, requerido, índice único)
  - Status (VARCHAR 50, valor por defecto "active")
  - CreatedAt (TIMESTAMP, valor por defecto NOW())
  - UpdatedAt (TIMESTAMP, valor por defecto NOW())
  - Índice compuesto en Email para búsquedas rápidas

### Program.cs
- Inyección de dependencias configurada
- DbContext registrado con Npgsql
- Servicios y repositorios registrados (Scoped)

---

## Paso 3: Migración inicial
**Estado:** ✅ COMPLETADO

### Archivos de migración generados
```
src/Migrations/
├── 20260317040523_InitialCreate.cs          # Migración forward
├── 20260317040523_InitialCreate.Designer.cs # Metadatos
└── AppDbModelSnapshot.cs                    # Snapshot del modelo
```

### Comando ejecutado
```bash
cd templates/dotnet10-api/src
dotnet-ef migrations add InitialCreate
```

### Resultado
✅ Migración creada exitosamente. Cuando se ejecute `dotnet-ef database update`, creará:
- Tabla [Users] en PostgreSQL
- Índices y restricciones configuradas en OnModelCreating

---

## Paso 4: Autenticación JWT + Endpoint protegido
**Estado:** ✅ COMPLETADO

### Configuración JWT en Program.cs
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(secretKey),
            ValidateLifetime = true,
            ...
        };
    });
```

### Endpoints de autenticación
- `POST /api/v1/auth/login` - Generar JWT token
  - Credenciales demo: username=`admin`, password=`password`
  - Retorna: `{ accessToken, tokenType: "Bearer", expiresIn: 3600 }`

### Endpoint protegido
- `GET /api/v1/users/me` (requiere `Authorization: Bearer <token>`)
  - Retorna información del usuario autenticado
  - Rechaza con 401 Unauthorized si no hay token válido

### Flujo de autenticación
1. Cliente: `POST /api/v1/auth/login` con credenciales
2. API: Genera JWT token válido por 1 hora
3. Cliente: Incluye token en header `Authorization: Bearer {token}`
4. API: Valida firma y expiración en endpoints protegidos

---

## Compilación y validación
**Estado:** ✅ EXITOSA

### Comando ejecutado
```bash
cd templates/dotnet10-api/src
dotnet build
```

### Resultado
```
✅ Build succeeded with 1 warning(s)
   Api net10.0 succeeded → bin/Debug/net10.0/Api.dll
```

---

## Pasos siguientes (Lab 05+)
1. Configurar PostgreSQL y ejecutar `dotnet-ef database update`
2. Agregar pruebas unitarias (xUnit + Moq)
3. Containerizar con Docker
4. Publicar en GitHub Container Registry
5. Desplegar en Kubernetes con Helm

---

## Archivos modificados/creados
- ✅ `Domain/User.cs` (constructor parametrizado)
- ✅ `Application/IUserService.cs` (DTOs actualizados)
- ✅ `Application/UserService.cs` (lógica actualizada)
- ✅ `Application/IUserRepository.cs` (interfaz completa)
- ✅ `Infrastructure/AppDb.cs` (mapeo EF Core)
- ✅ `Infrastructure/UserRepository.cs` (implementación)
- ✅ `Controllers/UsersController.cs` (endpoints CRUD)
- ✅ `Controllers/AuthController.cs` (JWT login)
- ✅ `Program.cs` (configuración JWT)
- ✅ `Api.csproj` (paquetes NuGet)
- ✅ `Migrations/20260317040523_InitialCreate.cs` (migración)
- ✅ `appsettings.json` (configuración)

## Conclusiones
La API está completamente funcional en términos de:
- Arquitectura limpia por capas
- CRUD con validaciones de negocio
- Autenticación JWT integrada
- Preparada para persistencia en PostgreSQL
- Build exitoso, sin errores de compilación
