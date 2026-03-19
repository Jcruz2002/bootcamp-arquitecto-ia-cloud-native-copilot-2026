# Lab 19 - NestJS API con TypeScript y PostgreSQL

## Objetivo
Construir una API RESTful con NestJS, TypeORM, autenticacion JWT y pruebas automatizadas, siguiendo una arquitectura modular.

## Implementacion realizada

### Estructura modular
Se implementaron los modulos:
- `users`: CRUD completo + paginacion + validacion
- `auth`: login JWT + rutas protegidas con guard
- `common/guards`: `JwtAuthGuard`

Archivos principales:
- `templates/nestjs-api/src/users/users.module.ts`
- `templates/nestjs-api/src/users/users.controller.ts`
- `templates/nestjs-api/src/users/users.service.ts`
- `templates/nestjs-api/src/auth/auth.module.ts`
- `templates/nestjs-api/src/auth/auth.controller.ts`
- `templates/nestjs-api/src/auth/auth.service.ts`
- `templates/nestjs-api/src/auth/jwt.strategy.ts`

### Persistencia TypeORM
Se configuro `TypeOrmModule.forRootAsync` con soporte:
- `postgres` para ejecucion normal
- `sqljs` para pruebas e2e en entorno aislado

Entidad de usuario:
- `id`, `email`, `name`, `isActive`, `roles`, `passwordHash`

Archivo:
- `templates/nestjs-api/src/users/entities/user.entity.ts`

### Validacion y seguridad
- `ValidationPipe` global con `whitelist`, `transform`, `forbidNonWhitelisted`
- DTOs con `class-validator`
- Password hash con `bcrypt`
- JWT en `/auth/login`
- Ruta protegida: `/auth/profile` (401 sin token)
- Ruta admin: `/auth/admin` (403 sin rol admin)

### Swagger
- Swagger habilitado en `/api`
- BearerAuth documentado en OpenAPI

Archivo:
- `templates/nestjs-api/src/main.ts`

### Contenerizacion
Archivos agregados:
- `templates/nestjs-api/Dockerfile`
- `templates/nestjs-api/.dockerignore`
- `templates/nestjs-api/.env.example`

## Variables de entorno
```env
PORT=3000
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=bootcamp
JWT_SECRET=cambia-este-secreto
JWT_EXPIRES_IN=3600s
DEFAULT_ADMIN_EMAIL=admin@bootcamp.local
DEFAULT_ADMIN_PASSWORD=admin123
```

## Validaciones ejecutadas

### Build
Comando:
```bash
npm run build
```
Resultado: OK

### Pruebas unitarias
Comando:
```bash
npm run test -- --runInBand
```
Resultado: 2 suites passed, 4 tests passed

### Cobertura
Comando:
```bash
npm run test:cov -- --runInBand
```
Resultado: OK (reporte generado)

### Pruebas e2e
Comando:
```bash
npm run test:e2e -- --runInBand
```
Resultado: 1 suite passed, 6 tests passed

Casos cubiertos en e2e:
- `GET /` retorna estado ok
- `POST /users` valida campos requeridos (400 si falta email)
- `POST /users` crea usuario
- `POST /auth/login` retorna JWT
- `GET /auth/profile` retorna 401 sin token
- `GET /auth/profile` retorna 200 con token

### Docker
Comandos ejecutados:
```bash
docker build -t nestjs-api:local .
docker run -d --name nestjs-api-lab19 -p 3002:3000 \
  -e DB_TYPE=sqljs \
  -e JWT_SECRET=change-this-secret \
  -e JWT_EXPIRES_IN=3600s \
  -e DEFAULT_ADMIN_EMAIL=admin@bootcamp.local \
  -e DEFAULT_ADMIN_PASSWORD=admin123 \
  nestjs-api:local
curl http://localhost:3002/health
```
Resultado:
- Imagen construida correctamente
- Contenedor arranco correctamente
- Health check: `STATUS:200`

## Nota de entorno
El enunciado indica Node.js 24 LTS. En el devcontainer se uso Node v20.20.1, y el proyecto funciono correctamente en build, test y e2e.

## Entregables cubiertos
- API funcional con validacion y JWT
- Pruebas unitarias y e2e en verde
- Contenerizacion validada
- Evidencia documentada en esta carpeta
