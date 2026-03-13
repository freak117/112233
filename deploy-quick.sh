#!/bin/bash

# =============================================================================
# Telegram Lite - Быстрый Деплой
# =============================================================================
# Использование: ./deploy-quick.sh
# =============================================================================

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Telegram Lite - Быстрый Деплой${NC}"
echo ""

cd ~/test || exit 1

# 1. Сохранение изменений
echo -e "${YELLOW}[1/5]${NC} Сохранение изменений..."
git stash push -m "auto-stash $(date +%H:%M)" 2>/dev/null || true

# 2. Обновление
echo -e "${YELLOW}[2/5]${NC} Обновление из репозитория..."
git pull origin main

# 3. Восстановление
echo -e "${YELLOW}[3/5]${NC} Восстановление изменений..."
git stash pop 2>/dev/null || true

# 4. Зависимости
echo -e "${YELLOW}[4/5]${NC} Проверка зависимостей..."
npm install --production 2>/dev/null || true

# 5. Сборка и запуск
echo -e "${YELLOW}[5/5]${NC} Сборка и запуск..."
docker compose build --no-cache web
docker compose up -d

echo ""
echo -e "${GREEN}✅ Готово!${NC}"
echo ""
echo -e "Web: ${BLUE}http://212.119.42.176:3000${NC}"
echo -e "API: ${BLUE}http://212.119.42.176:3001/api/v1${NC}"
echo ""
