## SOLUCION

1. 1. Define el alcance de una API simple de usuarios.

"Necesito que me definas el alcance de una api simple de usuarios"

RTA:

Aquí tienes un alcance claro y práctico para una API simple de usuarios (MVP):

**Objetivo**
Permitir crear, consultar, actualizar y eliminar usuarios de forma segura y trazable.

**Alcance funcional (incluido)**
1. CRUD de usuarios:
2. `POST /api/v1/users` crear usuario.
3. `GET /api/v1/users` listar usuarios (con paginación básica).
4. `GET /api/v1/users/{id}` obtener detalle.
5. `PUT /api/v1/users/{id}` actualizar datos.
6. `DELETE /api/v1/users/{id}` eliminar usuario (recomendado borrado lógico).

**Modelo mínimo de datos**
1. `id` (UUID o autoincremental).
2. `name` (obligatorio).
3. `email` (obligatorio, único).
4. `status` (`active`/`inactive`).
5. `createdAt`.
6. `updatedAt`.

**Reglas y validaciones**
1. Email con formato válido.
2. Email único.
3. Nombre no vacío y con longitud mínima.
4. No permitir actualización de campos internos (`createdAt`, `id`).

**Seguridad mínima**
1. Autenticación con JWT.
2. Endpoints protegidos (al menos lectura/escritura autenticada).
3. Si manejas contraseña: almacenamiento hasheado (nunca en texto plano).

**Respuestas y errores**
1. JSON estandarizado.
2. Códigos HTTP correctos: `201`, `200`, `204`, `400`, `401`, `404`, `409`.
3. Mensajes de error claros (ejemplo: email duplicado).

**No funcional mínimo**
1. Documentación OpenAPI/Swagger.
2. Logs básicos de request/error.
3. Pruebas mínimas:
4. Unitarias de validación.
5. Integración de endpoints principales.

**Fuera de alcance (para mantenerlo simple)**
1. Recuperación de contraseña por correo.
2. OAuth social (Google/Microsoft).
3. Gestión avanzada de roles/permisos.
4. Auditoría completa y versionado de cambios.

**Criterios de aceptación**
1. CRUD completo funcionando.
2. Validaciones aplicadas correctamente.
3. No se permiten emails duplicados.
4. API documentada y testeable en Swagger.
5. Pruebas principales en verde.

2. Pide a Copilot una propuesta de arquitectura por capas.

"Teniendo encuenta eso proponme una arquitectura de capas"


RTA: 

Perfecto. Para una API simple de usuarios, te propongo una arquitectura por capas tipo Clean/Onion, sencilla pero profesional para crecer luego.

**Arquitectura de capas propuesta**

1. Capa de Presentación (API)
- Expone endpoints REST.
- Recibe requests, valida formato básico y devuelve HTTP status.
- No contiene lógica de negocio compleja.
- Componentes:
  - Controllers
  - DTOs de entrada/salida
  - Middleware de autenticación/autorización
  - Manejo global de errores

2. Capa de Aplicación (Use Cases)
- Orquesta los casos de uso del sistema.
- Define reglas de flujo: crear usuario, actualizar, listar, eliminar.
- Aplica validaciones de negocio (por ejemplo: email único).
- Componentes:
  - Services o UseCases (CreateUser, UpdateUser, GetUsers, etc.)
  - Interfaces de repositorio (contratos)
  - Mapeo DTO <-> dominio

3. Capa de Dominio
- Núcleo del negocio, independiente de frameworks.
- Define entidades y reglas puras del dominio.
- Componentes:
  - Entity User
  - Value Objects opcionales (Email)
  - Reglas de negocio (invariantes)

4. Capa de Infraestructura
- Implementa acceso a recursos externos.
- Conecta con DB, JWT provider, logging, cache.
- Componentes:
  - Repositorio concreto (UserRepositorySql)
  - ORM/DB context
  - Implementación de hash de contraseña
  - Adaptadores externos

**Flujo de una solicitud**
1. Controller recibe POST /users.
2. Valida DTO y llama al caso de uso CreateUser.
3. Caso de uso verifica reglas (email no repetido).
4. Usa interfaz de repositorio para persistir.
5. Infraestructura guarda en DB.
6. Responde 201 con DTO de salida.

**Estructura de carpetas sugerida**
- src/presentation
- src/application
- src/domain
- src/infrastructure
- src/shared

**Ventajas para tu lab**
1. Te permite explicar claramente separación de responsabilidades.
2. Facilita refactor y pruebas unitarias por capa.
3. Encaja con los siguientes pasos del lab: endpoint, refactor, tests, riesgos.

3. Genera un endpoint inicial y solicita explicacion linea por linea.

"Ahora necesito que generes un endpoint inicial y dame una explicacion linea por linea"

RTA: 

Aquí tienes un endpoint inicial en ASP.NET Core para obtener un usuario por id.

~~~csharp
using System;
using Microsoft.AspNetCore.Mvc;

namespace Bootcamp.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        if (id == Guid.Empty)
        {
            return BadRequest("Id invalido.");
        }

        var user = new UserResponse(
            id,
            "Ana Perez",
            "ana.perez@demo.com",
            "active"
        );

        return Ok(user);
    }
}

public record UserResponse(Guid Id, string Name, string Email, string Status);
~~~

Explicacion linea por linea:

1. Importa tipos base de C#.
2. Importa el paquete de MVC para controladores y respuestas HTTP.
3. Linea en blanco para legibilidad.
4. Declara el namespace del modulo API.
5. Linea en blanco.
6. Marca la clase como controlador API y habilita convenciones de validacion/respuesta.
7. Define la ruta base del controlador.
8. Declara el controlador UsersController heredando de ControllerBase.
9. Abre la clase.
10. Define que este metodo responde a GET con parametro id en la URL y formato GUID.
11. Declara el metodo GetById que recibe un Guid y retorna una respuesta HTTP.
12. Abre el metodo.
13. Valida un caso basico de entrada invalida.
14. Abre bloque if.
15. Retorna HTTP 400 si el id no es valido.
16. Cierra bloque if.
17. Linea en blanco.
18. Crea un objeto de respuesta de usuario (mock inicial para el primer endpoint).
19. Asigna el id recibido.
20. Asigna nombre de ejemplo.
21. Asigna email de ejemplo.
22. Asigna estado de ejemplo.
23. Cierra la creacion del objeto.
24. Linea en blanco.
25. Retorna HTTP 200 con el usuario en formato JSON.
26. Cierra el metodo.
27. Cierra la clase.
28. Linea en blanco.
29. Define el DTO de salida con 4 campos.

Si quieres, el siguiente paso te lo doy ya en version por capas (Controller + Service + Repository interface) para que quede alineado con el punto 2 del lab.

4. Solicita refactor para legibilidad y mantenibilidad.

