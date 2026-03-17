# Evidencia Lab 05 - Next 16 frontend conectado a API + proteccion de rutas

## Objetivo
Construir UI funcional en Next 16 para gestionar usuarios consumiendo el backend .NET del Lab 03, con proteccion de rutas mediante JWT, CRUD completo y notificaciones visuales.

## Implementacion realizada

### Estructura de archivos creados
| Archivo | Descripcion |
|---|---|
| `src/pages/index.js` | Redireccion automatica segun sesion activa |
| `src/pages/login.js` | Formulario de login, obtiene JWT del Lab 03 y muestra flash de sesion |
| `src/pages/users.js` | Ruta protegida con CRUD completo de usuarios |
| `src/pages/_app.js` | Bootstrap global de estilos |
| `src/styles/globals.css` | Estilos responsive, estados UI y toasts |
| `src/lib/auth.js` | Modulo de sesion: token JWT y mensajes flash entre pantallas |
| `src/components/Toast.js` | Componente reutilizable para notificaciones flotantes |
| `.env.example` | Variable de entorno `NEXT_PUBLIC_API_BASE_URL` |
| `next.config.js` | Limpiado para eliminar warning de serverActions en Next 16 |

### Capacidades implementadas en UI
- Login protegido contra acceso sin sesion.
- Listado de usuarios.
- Creacion de usuarios.
- Edicion de usuarios desde la misma pantalla.
- Eliminacion de usuarios con confirmacion.
- Logout con redireccion al login.
- Notificaciones toast para login, logout, crear, actualizar y eliminar.
- Mensajes flash persistidos entre redirecciones para que el toast de login/logout se vea en la pantalla destino.
- Eliminacion del campo `API Base URL` del frontend para fijar el backend del Lab 03.

### Flujo de proteccion de rutas
1. `/` detecta si hay JWT en localStorage y redirige a `/users` o `/login`.
2. `/login` llama a `POST /api/v1/auth/login` del Lab 03 y guarda el token.
3. `/users` verifica token al montar; si no existe redirige a `/login`.
4. Cada request a la API incluye `Authorization: Bearer <token>`.
5. Si el backend responde 401, se limpia la sesion y se redirige al login.
6. Los mensajes de inicio/cierre de sesion se guardan como flash y se muestran como toast en la pantalla siguiente.

### CORS habilitado en backend Lab 03
Se agrego politica `LabCors` en `Program.cs` para permitir requests desde el frontend en desarrollo:
```csharp
options.AddPolicy("LabCors", policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
```

## Comandos ejecutados

### Backend Lab 03 (.NET)
```bash
# Levantar PostgreSQL
docker compose -f infra/docker-compose.data.yml up -d postgres

# Aplicar migraciones
cd templates/dotnet10-api/src
dotnet ef database update

# Iniciar API en modo Development
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls http://0.0.0.0:8080
```

### Frontend Next 16
```bash
cd templates/next16-app
npm install
npm run build   # build limpio sin warnings
npm run dev     # servidor dev en puerto 3000

# cuando el navegador seguia mostrando una version vieja
pkill -f "next dev|next-server" || true
rm -rf .next
npm run dev
```

## Resultados obtenidos
- `npm install`: completado sin vulnerabilidades.
- `npm run build`: 5 rutas compiladas exitosamente (/, /_app, /404, /login, /users).
- `npm run dev`: Ready in ~36s en http://localhost:3000.
- Reinicio con limpieza de cache (`rm -rf .next`) realizado para forzar recompilacion del frontend activo.

### Validacion de proteccion JWT (HTTP real)
| Endpoint | Sin token | Con token |
|---|---|---|
| `GET /api/v1/users/me` | 401 | 200 |
| `GET /api/v1/users` | 200 (publico) | 200 |
| `POST /api/v1/auth/login` | 200 (devuelve accessToken) | — |

### Validacion de rutas Next
| Ruta | HTTP | Comportamiento |
|---|---|---|
| `/login` | 200 | Muestra formulario |
| `/users` | 200 | Muestra UI (guard activo en cliente) |
| `/` | 200 | Redirige segun sesion |

## Validacion funcional (checklist)
- [x] Login con credenciales `admin / password` obtiene JWT del Lab 03.
- [x] Ruta `/users` redirige a `/login` si no hay token.
- [x] Token almacenado en localStorage (`lab05_jwt`).
- [x] Listado de usuarios carga con `Authorization: Bearer`.
- [x] Alta de usuario funciona con token.
- [x] Edicion de usuario funciona con `PUT /api/v1/users/{id}`.
- [x] Eliminacion de usuario funciona con `DELETE /api/v1/users/{id}`.
- [x] Sesion expirada (401 del backend) redirige al login automaticamente.
- [x] Boton de cierre de sesion limpia token y redirige al login.
- [x] Campo `API Base URL` eliminado del frontend.
- [x] Toast de inicio de sesion mostrado en `/users`.
- [x] Toast de cierre de sesion mostrado en `/login`.
- [x] Toast de crear, actualizar y eliminar mostrado en la pantalla de usuarios.
- [x] Estados de carga y error visibles en UI.
- [x] Build de produccion sin warnings.

## Configuracion del frontend
El frontend quedo fijado para trabajar contra el backend del Lab 03 en el puerto 8080. Se mantiene `.env.example` con esta referencia:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Nota: aunque el ejemplo de entorno existe, la UI final ya no expone el campo `API Base URL` al usuario.

## URLs activas para pruebas
- Frontend (login): http://localhost:3000/login
- Frontend (ruta protegida): http://localhost:3000/users
- Backend Swagger: http://localhost:8080/swagger/index.html
- Backend health: http://localhost:8080/health

## Credenciales demo
- Username: `admin`
- Password: `password`

## Notas finales
- El feedback de usuario queda duplicado intencionalmente entre mensaje inline y toast mientras se valida visualmente el comportamiento.
- Si se desea una UX mas limpia, el siguiente ajuste recomendable es dejar solo toast y remover el mensaje inline verde debajo del formulario.
