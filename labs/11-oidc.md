# Lab 11 - OIDC base (Entra, Google o Keycloak)

## Objetivo
Implementar autenticación federada y autorización por roles en un proveedor inicial.

## Prerrequisitos
- Backend y frontend desplegables.

## Paso a paso
1. Configura cliente OIDC en proveedor.
2. Integra login en frontend.
3. Configura JwtBearer en backend.
4. Define roles y políticas de autorización.
5. Prueba escenarios 401, 403 y 200.

## Validación
- Login exitoso y sesión estable.
- Endpoints protegidos con control por rol.

## Continuación recomendada
Para completar el escenario empresarial multi-proveedor, ejecuta `18-sso-oidc-entra-google-keycloak.md`.

## Rúbrica
- 40% autenticación.
- 40% autorización.
- 20% evidencia.

## Entregables
- Registra los resultados obtenidos en la carpeta labs/evidencias.
- Crea la evidencia por laboratorio siguiendo la nomenclatura lab-XX-tema. Si tu evidencia requiere mas de un archivo, crea una carpeta con esa misma nomenclatura y guarda alli todos los archivos (por ejemplo: .md, .pdf, .docx, imagenes o capturas).

- EVIDENCIAS.md con pruebas de acceso por rol.

