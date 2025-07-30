@echo off
echo.
echo ========================================
echo    PlantShop - Простий запуск
echo ========================================
echo.

echo 🔍 Перевірка доступних серверів...
echo.

REM Перевірка Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python знайдено
    echo 🚀 Запуск через Python...
    echo.
    echo 📱 Сайт буде доступний за адресою:
    echo    http://localhost:8000
    echo.
    echo 🔄 Для зупинки сервера натисніть Ctrl+C
    echo.
    python -m http.server 8000
    goto :end
)

REM Перевірка Python3
python3 --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python3 знайдено
    echo 🚀 Запуск через Python3...
    echo.
    echo 📱 Сайт буде доступний за адресою:
    echo    http://localhost:8000
    echo.
    echo 🔄 Для зупинки сервера натисніть Ctrl+C
    echo.
    python3 -m http.server 8000
    goto :end
)

REM Перевірка Node.js
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js знайдено
    echo 🚀 Запуск через Node.js...
    echo.
    echo 📱 Сайт буде доступний за адресою:
    echo    http://localhost:3000
    echo.
    echo 🔄 Для зупинки сервера натисніть Ctrl+C
    echo.
    if exist "node_modules" (
        npm start
    ) else (
        echo 📦 Встановлення залежностей...
        npm install
        npm start
    )
    goto :end
)

REM Якщо нічого не знайдено
echo ❌ Не знайдено жодного сервера!
echo.
echo 📥 Встановіть один з варіантів:
echo.
echo 1️⃣ Python (рекомендовано):
echo    https://www.python.org/downloads/
echo.
echo 2️⃣ Node.js:
echo    https://nodejs.org/
echo.
echo 3️⃣ Або просто відкрийте index.html у браузері
echo.
echo 💡 Після встановлення перезапустіть цей файл
echo.

:end
pause 