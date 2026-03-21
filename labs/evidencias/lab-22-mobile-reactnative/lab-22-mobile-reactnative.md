# Evidencia Lab 22 - Mobile con React Native y Expo

## Objetivo
Construir una app mobile con Expo que consuma la API del bootcamp e integre login OIDC con PKCE.

## Avance realizado
- Proyecto creado en `templates/mobile-reactnative-app` con plantilla tabs de Expo Router.
- Dependencias instaladas para API, navegacion y autenticacion:
  - `axios`
  - `expo-auth-session`, `expo-crypto`, `expo-web-browser`, `expo-secure-store`
  - `@react-navigation/native`, `@react-navigation/native-stack`
- Guard de autenticacion agregado en layout principal.
- Pantalla de login implementada con flujo OIDC.
- Pantalla principal conectada a API (`/api/v1/users`).
- Pantalla de sesion con logout y limpieza de token.
- Variables de entorno de ejemplo agregadas en `.env.local.example`.
- Esquema de app configurado a `mobileapp` para redirect URI.

## Archivos clave
- `templates/mobile-reactnative-app/services/api.ts`
- `templates/mobile-reactnative-app/services/auth.ts`
- `templates/mobile-reactnative-app/app/login.tsx`
- `templates/mobile-reactnative-app/app/_layout.tsx`
- `templates/mobile-reactnative-app/app/(tabs)/index.tsx`
- `templates/mobile-reactnative-app/app/(tabs)/two.tsx`
- `templates/mobile-reactnative-app/.env.local.example`

## Comandos ejecutados
```bash
cd templates
npx create-expo-app@latest mobile-reactnative-app --template tabs --yes

cd mobile-reactnative-app
npx expo install expo-auth-session expo-crypto expo-web-browser expo-secure-store react-native-safe-area-context react-native-screens
npm install @react-navigation/native @react-navigation/native-stack axios
npx tsc --noEmit
```

## Pendiente para cerrar el lab
- Ejecutar en emulador Android: `npm run android`
- Completar login real contra tu IdP OIDC.
- Capturar pantallas de login, lista y detalle para evidencia final.
