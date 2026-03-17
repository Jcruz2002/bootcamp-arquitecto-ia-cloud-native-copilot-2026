#!/bin/bash

# Script de pruebas para API REST - Lab 03
# Uso: bash test-api.sh

BASE_URL="https://localhost:7001/api/v1"
TOKEN=""

echo "==================================="
echo "🚀 Test API .NET 10"
echo "==================================="

# 1. Health Check
echo -e "\n✅ 1. Health Check"
curl -s -X GET "https://localhost:7001/health" | jq .

# 2. Login y obtener token
echo -e "\n✅ 2. Login (obtener JWT token)"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
echo "Token obtenido: ${TOKEN:0:50}..."

# 3. Crear usuario 1
echo -e "\n✅ 3. Crear usuario - Juan Pérez"
USER1=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@demo.com"
  }')
echo "$USER1" | jq .
USER1_ID=$(echo "$USER1" | jq -r '.id')
echo "ID Usuario 1: $USER1_ID"

# 4. Crear usuario 2
echo -e "\n✅ 4. Crear usuario - María García"
USER2=$(curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@demo.com"
  }')
echo "$USER2" | jq .
USER2_ID=$(echo "$USER2" | jq -r '.id')

# 5. Obtener usuario por ID
echo -e "\n✅ 5. Obtener usuario por ID"
curl -s -X GET "$BASE_URL/users/$USER1_ID" | jq .

# 6. Listar usuarios (paginado)
echo -e "\n✅ 6. Listar usuarios (skip=0, take=10)"
curl -s -X GET "$BASE_URL/users?skip=0&take=10" | jq .

# 7. Actualizar usuario
echo -e "\n✅ 7. Actualizar usuario - cambiar nombre"
curl -s -X PUT "$BASE_URL/users/$USER1_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Carlos Pérez",
    "email": null,
    "status": "active"
  }' | jq .

# 8. Intentar crear usuario con email duplicado (error 409)
echo -e "\n✅ 8. Intentar email duplicado (debe fallar con 409)"
curl -s -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Otro Usuario",
    "email": "juan@demo.com"
  }' | jq .

# 9. Endpoint protegido SIN token (error 401)
echo -e "\n✅ 9. Acceder a /me sin token (debe retornar 401)"
curl -s -X GET "$BASE_URL/users/me" | jq .

# 10. Endpoint protegido CON token (éxito 200)
echo -e "\n✅ 10. Acceder a /me con token JWT (debe retornar 200)"
curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 11. Obtener usuario no existente (error 404)
echo -e "\n✅ 11. Obtener usuario no existente (debe retornar 404)"
curl -s -X GET "$BASE_URL/users/00000000-0000-0000-0000-000000000000" | jq .

# 12. Eliminar usuario
echo -e "\n✅ 12. Eliminar usuario"
curl -s -X DELETE "$BASE_URL/users/$USER2_ID"
echo -e "\nRespuesta: 204 No Content (sin body)"

# 13. Verificar que fue eliminado
echo -e "\n✅ 13. Verificar usuario eliminado (debe retornar 404)"
curl -s -X GET "$BASE_URL/users/$USER2_ID" | jq .

echo -e "\n==================================="
echo "✅ Pruebas completadas"
echo "==================================="
