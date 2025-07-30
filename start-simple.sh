#!/bin/bash

echo ""
echo "========================================"
echo "    PlantShop - Простий запуск"
echo "========================================"
echo ""

echo "🔍 Перевірка доступних серверів..."
echo ""

# Перевірка Python3
if command -v python3 &> /dev/null; then
    echo "✅ Python3 знайдено"
    echo "🚀 Запуск через Python3..."
    echo ""
    echo "📱 Сайт буде доступний за адресою:"
    echo "   http://localhost:8000"
    echo ""
    echo "🔄 Для зупинки сервера натисніть Ctrl+C"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# Перевірка Python
if command -v python &> /dev/null; then
    echo "✅ Python знайдено"
    echo "🚀 Запуск через Python..."
    echo ""
    echo "📱 Сайт буде доступний за адресою:"
    echo "   http://localhost:8000"
    echo ""
    echo "🔄 Для зупинки сервера натисніть Ctrl+C"
    echo ""
    python -m http.server 8000
    exit 0
fi

# Перевірка Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js знайдено"
    echo "🚀 Запуск через Node.js..."
    echo ""
    echo "📱 Сайт буде доступний за адресою:"
    echo "   http://localhost:3000"
    echo ""
    echo "🔄 Для зупинки сервера натисніть Ctrl+C"
    echo ""
    if [ -d "node_modules" ]; then
        npm start
    else
        echo "📦 Встановлення залежностей..."
        npm install
        npm start
    fi
    exit 0
fi

# Якщо нічого не знайдено
echo "❌ Не знайдено жодного сервера!"
echo ""
echo "📥 Встановіть один з варіантів:"
echo ""
echo "1️⃣ Python3 (рекомендовано):"
echo "   sudo apt-get install python3"
echo ""
echo "2️⃣ Node.js:"
echo "   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -"
echo "   sudo apt-get install -y nodejs"
echo ""
echo "3️⃣ Або просто відкрийте index.html у браузері"
echo ""
echo "💡 Після встановлення перезапустіть цей скрипт"
echo "" 