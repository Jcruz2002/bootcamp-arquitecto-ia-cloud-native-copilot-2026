# Evidencia Lab 06 - Angular 21 frontend alternativo

## Objetivo
Implementar un frontend Angular 21 que consuma los mismos endpoints del backend usados en los labs anteriores, con CRUD de usuarios, validaciones y manejo uniforme de errores HTTP.

## Implementacion realizada

### Arquitectura frontend
- App standalone con Angular 21.
- Rutas principales:
  - `/login`: autenticacion con JWT.
  - `/users`: ruta protegida con CRUD.
- Guard de autenticacion para proteger `/users`.
- Interceptor de token para inyectar `Authorization: Bearer <jwt>`.
- Interceptor de errores para estandarizar mensajes y reaccionar a 401.
- Formularios reactivos con validaciones en login y formulario de usuario.
- Componente toast global para feedback visual uniforme.

### Endpoints consumidos
- `POST /api/v1/auth/login`
- `GET /api/v1/users?skip=0&take=20`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `DELETE /api/v1/users/{id}`

### Conexion al backend de Lab 03
- Base URL configurada en Angular: `http://localhost:8080`.
- Archivo de configuracion: `src/environments/environment.development.ts`.
- Constante compartida usada por servicios: `src/app/core/app.constants.ts`.

## Comandos ejecutados
```bash
cd templates/angular21-app
npm install
npm run build
npm start
```

## Resultado esperado
- CRUD basico de usuarios funcionando en Angular.
- Validaciones visibles en formularios.
- Manejo uniforme de errores HTTP.
- Ruta `/users` protegida por sesion.

## Resultado obtenido
- Build de produccion exitoso (`ng build`).
- Login funcional con JWT del backend.
- Listado, creacion, edicion y eliminacion de usuarios implementados.
- Validaciones de formulario activas:
  - Username y password requeridos con longitud minima.
  - Nombre requerido con longitud minima.
  - Email requerido con formato valido.
- Errores HTTP centralizados por interceptor y mostrados como toast.
- En respuestas 401 (excepto login), se limpia sesion y se redirige a `/login`.

## Problemas y solucion
- Problema: `@angular/cli@next` fallaba por version de Node del entorno.
- Solucion: se genero el proyecto con `@angular/cli@21`, compatible con el objetivo del laboratorio.

## Validacion funcional (checklist)
- [x] Login contra API con JWT.
- [x] Ruta protegida para usuarios.
- [x] Listado de usuarios.
- [x] Crear usuario.
- [x] Editar usuario.
- [x] Eliminar usuario.
- [x] Validaciones reactivas visibles.
- [x] Manejo uniforme de errores HTTP.

## Comparacion tecnica breve: Angular vs Next
- Angular 21:
  - Arquitectura opinionada para apps SPA con DI, guards e interceptores nativos.
  - Excelente para estandarizar reglas transversales (auth, errores, politicas HTTP).
  - Mayor estructura inicial, pero facilita escalabilidad en equipos grandes.
- Next 16:
  - Muy rapido para iniciar y entregar UI con routing simple.
  - Menor friccion inicial para casos CRUD pequenos.
  - Requiere decidir patrones propios para capas transversales si el proyecto crece.

## Conclusiones
Angular 21 cumple el objetivo del Lab 06 como frontend alternativo, reutilizando el backend existente y agregando una base de arquitectura frontend robusta (guards, interceptores, formularios reactivos y feedback uniforme).

## Capturas o logs
- Capturas de interfaz (login y vista de usuarios) validadas en ejecucion local.
- Verificacion de backend (`GET /health`): HTTP 200 con estado `ok`.
- Verificacion de frontend Angular (`GET /`): HTTP 200 en `http://localhost:4200`.
- Build de frontend exitoso:

```text
> angular21-app@0.0.0 build
> ng build

Application bundle generation complete.
Output location: templates/angular21-app/dist/angular21-app
```

## URLs usadas en validacion
- Frontend Angular: `http://localhost:4200`
- Backend Lab 03 health: `http://localhost:8080/health`
- Backend Lab 03 Swagger: `http://localhost:8080/swagger/index.html`
