#!/bin/bash

echo ""
echo "========================================"
echo "    PlantShop - Локальний сервер"
echo "========================================"
echo ""

# Перевірка чи встановлений Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Помилка: Node.js не встановлений!"
    echo ""
    echo "📥 Завантажте та встановіть Node.js з:"
    echo "   https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js знайдено"
echo ""

# Перевірка чи встановлені залежності
if [ ! -d "node_modules" ]; then
    echo "📦 Встановлення залежностей..."
    npm install
    echo ""
fi

echo "🚀 Запуск сервера..."
echo ""
echo "📱 Сайт буде доступний за адресою:"
echo "   http://localhost:3000"
echo ""
echo "🔄 Для зупинки сервера натисніть Ctrl+C"
echo ""

npm start 