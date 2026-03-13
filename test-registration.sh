#!/bin/bash
# Тестирование регистрации Telegram Lite

API_URL="http://212.119.42.176:3001/api/v1"

echo "=========================================="
echo "Тестирование регистрации Telegram Lite"
echo "=========================================="
echo ""

# Тест 1: Успешная регистрация
echo "📝 Тест 1: Регистрация нового пользователя..."
RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@example.com",
    "password": "password123",
    "username": "testuser123",
    "displayName": "Test User"
  }')

echo "Ответ API:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Проверка успешной регистрации
if echo "$RESPONSE" | grep -q '"accessToken"'; then
    echo "✅ Тест 1 ПРОЙДЕН: Пользователь успешно зарегистрирован"
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:50}..."
else
    echo "❌ Тест 1 НЕ ПРОЙДЕН: Ошибка регистрации"
fi
echo ""

# Тест 2: Регистрация с существующим email
echo "📝 Тест 2: Регистрация с существующим email (должна быть ошибка)..."
RESPONSE2=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@example.com",
    "password": "password123",
    "username": "anotheruser",
    "displayName": "Another User"
  }')

echo "Ответ API:"
echo "$RESPONSE2" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE2"
echo ""

if echo "$RESPONSE2" | grep -qi "already"; then
    echo "✅ Тест 2 ПРОЙДЕН: Email уже занят"
else
    echo "❌ Тест 2 НЕ ПРОЙДЕН: Должна быть ошибка"
fi
echo ""

# Тест 3: Регистрация с невалидным email
echo "📝 Тест 3: Регистрация с невалидным email..."
RESPONSE3=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "username": "validuser",
    "displayName": "Valid User"
  }')

echo "Ответ API:"
echo "$RESPONSE3" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE3"
echo ""

if echo "$RESPONSE3" | grep -qi "email"; then
    echo "✅ Тест 3 ПРОЙДЕН: Email валидируется"
else
    echo "❌ Тест 3 НЕ ПРОЙДЕН: Должна быть ошибка валидации"
fi
echo ""

# Тест 4: Регистрация с коротким паролем
echo "📝 Тест 4: Регистрация с коротким паролем..."
RESPONSE4=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@example.com",
    "password": "short",
    "username": "validuser2",
    "displayName": "Valid User 2"
  }')

echo "Ответ API:"
echo "$RESPONSE4" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE4"
echo ""

if echo "$RESPONSE4" | grep -qi "password"; then
    echo "✅ Тест 4 ПРОЙДЕН: Пароль валидируется"
else
    echo "❌ Тест 4 НЕ ПРОЙДЕН: Должна быть ошибка валидации пароля"
fi
echo ""

# Тест 5: Логин успешный
echo "📝 Тест 5: Логин зарегистрированного пользователя..."
RESPONSE5=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@example.com",
    "password": "password123"
  }')

echo "Ответ API:"
echo "$RESPONSE5" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE5"
echo ""

if echo "$RESPONSE5" | grep -q '"accessToken"'; then
    echo "✅ Тест 5 ПРОЙДЕН: Логин успешен"
else
    echo "❌ Тест 5 НЕ ПРОЙДЕН: Ошибка логина"
fi
echo ""

# Тест 6: Логин с неверным паролем
echo "📝 Тест 6: Логин с неверным паролем..."
RESPONSE6=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@example.com",
    "password": "wrongpassword"
  }')

echo "Ответ API:"
echo "$RESPONSE6" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE6"
echo ""

if echo "$RESPONSE6" | grep -qi "invalid\|unauthorized"; then
    echo "✅ Тест 6 ПРОЙДЕН: Неверный пароль отклонён"
else
    echo "❌ Тест 6 НЕ ПРОЙДЕН: Должна быть ошибка авторизации"
fi
echo ""

echo "=========================================="
echo "Тестирование завершено!"
echo "=========================================="
