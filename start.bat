@echo off
echo.
echo ========================================
echo    PlantShop - Локальний сервер
echo ========================================
echo.

REM Перевірка чи встановлений Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Помилка: Node.js не встановлений!
    echo.
    echo 📥 Завантажте та встановіть Node.js з:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js знайдено
echo.

REM Перевірка чи встановлені залежності
if not exist "node_modules" (
    echo 📦 Встановлення залежностей...
    npm install
    echo.
)

echo 🚀 Запуск сервера...
echo.
echo 📱 Сайт буде доступний за адресою:
echo    http://localhost:3000
echo.
echo 🔄 Для зупинки сервера натисніть Ctrl+C
echo.

npm start

pause 