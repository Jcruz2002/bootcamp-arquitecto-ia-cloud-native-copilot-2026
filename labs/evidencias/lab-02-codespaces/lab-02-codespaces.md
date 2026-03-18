# Evidencias Lab 02 - Codespaces y devcontainer reproducible

## Objetivo
Configurar y validar un entorno cloud reproducible en GitHub Codespaces para desarrollar sin depender de instalaciones locales.

## Alcance ejecutado
- Creacion de Codespace desde el repositorio del bootcamp.
- Verificacion de herramientas base requeridas por los labs.
- Prueba de runtime para confirmar ejecucion de codigo.
- Revision del entorno para detectar dependencias faltantes.

## Comandos ejecutados
```bash
git --version
node --version
python --version
dotnet --version
docker --version
node -e "console.log('Entorno funcionando correctamente')"
```

## Resultado esperado
- El Codespace inicia sin errores.
- Herramientas base disponibles y operativas.
- Runtime funcional para ejecutar codigo.
- No se requieren ajustes adicionales del devcontainer para este alcance.

## Resultado obtenido
### 1) Verificacion de herramientas base
```text
git version 2.49.0
v20.20.1
Python 3.12.1
10.0.201
Docker version 28.1.1-1, build 4eba3773274f9d21ba90ae5bc719c3f1e4bb07a1
```

### 2) Validacion de runtime
```text
Entorno funcionando correctamente
```

## Evidencia de reproducibilidad
- El entorno se levanta con las mismas versiones principales al recrear el Codespace.
- Las herramientas necesarias para labs de backend, frontend y contenedores quedaron listas desde el inicio.
- No fue necesario instalar paquetes manuales para cumplir este laboratorio.

## Problemas y solucion
- Problemas encontrados: ninguno bloqueante.
- Solucion aplicada: no aplica.

## Conclusiones
- El entorno de Codespaces cumple el objetivo de reproducibilidad para el bootcamp.
- La base de herramientas (git, node, python, dotnet, docker) permite continuar con los laboratorios siguientes sin friccion inicial.

## Capturas o logs
- Se adjuntan los logs de terminal anteriores como evidencia de versiones y validacion de runtime.