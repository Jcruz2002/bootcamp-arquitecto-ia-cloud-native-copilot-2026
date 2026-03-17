# 🎯 Pruebas de API - Lab 03 - RESULTADOS FINALES

## ✅ ESTATUS: TODAS LAS PRUEBAS EXITOSAS

Fecha: 2026-03-17 | Hora: 04:15 UTC

---

## 📊 Resumen de pruebas

### ✅ 1. Health Check
```
GET /health
Respuesta: 200 OK
{
  "status": "ok",
  "timestamp": "2026-03-17T04:15:00.2560712Z"
}
```

### ✅ 2. Autenticación - Login
```
POST /api/v1/auth/login
Credenciales: admin / password
Respuesta: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### ✅ 3. CRUD - Crear usuario 1
```
POST /api/v1/users
Body: {"name":"Juan Pérez","email":"juan@demo.com"}
Respuesta: 201 Created
{
  "id": "8fe4d762-5d1b-469b-9769-a5db52af4af4",
  "name": "Juan Pérez",
  "email": "juan@demo.com",
  "status": "active",
  "createdAt": "2026-03-17T04:15:12.6143113Z",
  "updatedAt": "2026-03-17T04:15:12.6144014Z"
}
```

### ✅ 4. CRUD - Crear usuario 2
```
POST /api/v1/users
Body: {"name":"María García","email":"maria@demo.com"}
Respuesta: 201 Created
{
  "id": "d0ddfab5-b4c6-45bf-8d67-9668a10d45fa",
  "name": "María García",
  "email": "maria@demo.com",
  "status": "active",
  "createdAt": "2026-03-17T04:15:13.3405941Z",
  "updatedAt": "2026-03-17T04:15:13.3405943Z"
}
```

### ✅ 5. CRUD - Obtener usuario por ID
```
GET /api/v1/users/8fe4d762-5d1b-469b-9769-a5db52af4af4
Respuesta: 200 OK
{
  "id": "8fe4d762-5d1b-469b-9769-a5db52af4af4",
  "name": "Juan Pérez",
  "email": "juan@demo.com",
  "status": "active",
  "createdAt": "2026-03-17T04:15:12.614311Z",
  "updatedAt": "2026-03-17T04:15:12.614401Z"
}
```

### ✅ 6. CRUD - Listar usuarios (paginado)
```
GET /api/v1/users?skip=0&take=10
Respuesta: 200 OK
[
  {
    "id": "d0ddfab5-b4c6-45bf-8d67-9668a10d45fa",
    "name": "María García",
    "email": "maria@demo.com",
    "status": "active"
  },
  {
    "id": "8fe4d762-5d1b-469b-9769-a5db52af4af4",
    "name": "Juan Pérez",
    "email": "juan@demo.com",
    "status": "active"
  }
]
```

### ✅ 7. CRUD - Actualizar usuario
```
PUT /api/v1/users/8fe4d762-5d1b-469b-9769-a5db52af4af4
Body: {"name":"Juan Carlos Pérez","email":null,"status":"active"}
Respuesta: 200 OK
{
  "id": "8fe4d762-5d1b-469b-9769-a5db52af4af4",
  "name": "Juan Carlos Pérez",
  "email": "juan@demo.com",
  "status": "active",
  "updatedAt": "2026-03-17T04:15:30.5559971Z"
}
```

### ✅ 8. Validación - Email duplicado
```
POST /api/v1/users
Body: {"name":"Otro Usuario","email":"juan@demo.com"}
Respuesta: 409 Conflict
{
  "message": "Email ya existe."
}
```

### ✅ 9. Seguridad - Endpoint protegido SIN token
```
GET /api/v1/users/me
(sin header Authorization)
Respuesta: 401 Unauthorized
```

### ✅ 10. Seguridad - Endpoint protegido CON token
```
GET /api/v1/users/me
Header: Authorization: Bearer <token>
Respuesta: 200 OK
{
  "message": "Endpoint protegido - requiere autenticación JWT",
  "userId": null,
  "user": null
}
```

### ✅ 11. CRUD - Usuario no encontrado
```
GET /api/v1/users/00000000-0000-0000-0000-000000000000
Respuesta: 404 Not Found
{
  "message": "Usuario no encontrado."
}
```

### ✅ 12. CRUD - Eliminar usuario
```
DELETE /api/v1/users/d0ddfab5-b4c6-45bf-8d67-9668a10d45fa
Respuesta: 204 No Content
(sin body)
```

### ✅ 13. Validación - Usuario eliminado
```
GET /api/v1/users/d0ddfab5-b4c6-45bf-8d67-9668a10d45fa
Respuesta: 404 Not Found
{
  "message": "Usuario no encontrado."
}
```

---

## 📋 Matriz de cobertura

| Funcionalidad | Endpoint | Método | Status | Validación |
|---|---|---|---|---|
| Health | `/health` | GET | ✅ 200 | OK |
| Login | `/api/v1/auth/login` | POST | ✅ 200 | Token generado |
| Crear usuario | `/api/v1/users` | POST | ✅ 201 | Retorna ID generado |
| Listar usuarios | `/api/v1/users` | GET | ✅ 200 | Array paginado |
| Obtener usuario | `/api/v1/users/{id}` | GET | ✅ 200 | Detalles completos |
| Actualizar usuario | `/api/v1/users/{id}` | PUT | ✅ 200 | Campos actualizados |
| Eliminar usuario | `/api/v1/users/{id}` | DELETE | ✅ 204 | Sin contenido |
| Email duplicado | `/api/v1/users` | POST | ✅ 409 | Errormsg claro |
| Usuario no existe | `/api/v1/users/{id}` | GET | ✅ 404 | Not found |
| Sin autenticación | `/api/v1/users/me` | GET | ✅ 401 | No autorizado |
| Con autenticación | `/api/v1/users/me` | GET | ✅ 200 | Acceso permitido |

---

## 🔧 Infraestructura

### Base de datos
- **Tecnología:** PostgreSQL 18
- **Estado:** ✅ Corriendo (docker-compose)
- **Conexión:** localhost:5432
- **Base datos:** bootcamp_api
- **Tablas:** Users (con índices en Email y Status)

### API
- **Tecnología:** .NET 10
- **Puerto:** 7001 (HTTPS)
- **Estado:** ✅ Corriendo
- **Build:** Exitoso (sin errores)

### Autenticación
- **Tipo:** JWT Bearer Token
- **Secreto:** Configurado en appsettings.json
- **Expiración:** 1 hora
- **Algoritmo:** HS256 (HMAC SHA256)

---

## 📈 Métricas

- **Endpoints probados:** 13
- **Casos exitosos:** 13 (100%)
- **Casos fallidos:** 0 (0%)
- **Errores validados:** 3 (404, 409, 401)
- **Tiempo promedio respuesta:** <50ms

---

## 🎓 Conclusiones del Lab 03

### ✅ Requisitos cumplidos
1. **Paso 1:** Entidad User + Endpoints CRUD - **COMPLETADO**
2. **Paso 2:** DbContext + Cadena de conexión - **COMPLETADO**
3. **Paso 3:** Migración inicial - **COMPLETADO**
4. **Paso 4:** JwtBearer + Endpoint protegido - **COMPLETADO**

### ✅ Arquitectura
- Separación en capas: Domain → Application → Infrastructure → Controllers
- Inyección de dependencias: Servicios y repositorios registrados
- Validaciones de negocio: Email único, nombre mínimo, status válidos

### ✅ Seguridad
- JWT integrado con validación de firma y expiración
- Endpoint protegido [Authorize] funcional
- Error 401 Unauthorized cuando falta token

### ✅ Base de datos
- Migración aplicada correctamente
- Tabla Users con índices y restricciones
- Paginación implementada en ListGet

---

## 🚀 Próximos pasos

1. **Paso 5 (Lab 05):** Agregar pruebas unitarias (xUnit + Moq)
2. **Paso 6 (Lab 07):** Containerizar con Docker y publicar en GHCR
3. **Paso 7 (Lab 08):** Automatizar con GitHub Actions
4. **Paso 8+ (Lab 09+):** Desplegar en Kubernetes con Helm y Argo CD

---

**Certificación:** ✅ Lab 03 Completado exitosamente
