@echo off
echo ========================================
echo    PlantShop - GitHub Pages Deploy
echo ========================================
echo.

REM Перевірка наявності Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ПОМИЛКА] Git не встановлений!
    echo Завантажте Git з: https://git-scm.com/
    echo.
    pause
    exit /b 1
)

echo [OK] Git знайдено
echo.

REM Перевірка чи це Git репозиторій
if not exist ".git" (
    echo [ІНФО] Ініціалізація Git репозиторію...
    git init
    if %errorlevel% neq 0 (
        echo [ПОМИЛКА] Не вдалося ініціалізувати Git репозиторій
        pause
        exit /b 1
    )
)

echo [ІНФО] Додавання файлів до Git...
git add .

echo [ІНФО] Створення коміту...
git commit -m "PlantShop website update - %date% %time%"

echo.
echo ========================================
echo    Налаштування GitHub репозиторію
echo ========================================
echo.
echo Для продовження вам потрібно:
echo 1. Створити репозиторій на GitHub.com
echo 2. Назвати його "plant-shop"
echo 3. Зробити публічним
echo 4. Скопіювати URL репозиторію
echo.

set /p repo_url="Введіть URL вашого GitHub репозиторію (наприклад, https://github.com/username/plant-shop.git): "

if "%repo_url%"=="" (
    echo [ПОМИЛКА] URL репозиторію не вказано
    pause
    exit /b 1
)

echo.
echo [ІНФО] Додавання віддаленого репозиторію...
git remote add origin "%repo_url%"

echo [ІНФО] Перейменування гілки на main...
git branch -M main

echo [ІНФО] Відправка файлів на GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ПОМИЛКА] Не вдалося відправити файли на GitHub
    echo Можливі причини:
    echo - Неправильний URL репозиторію
    echo - Проблеми з автентифікацією
    echo - Репозиторій не створений
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    УСПІШНО РОЗГОРНУТО!
echo ========================================
echo.
echo Ваш сайт буде доступний за адресою:
echo https://%repo_url:~19,-4%.github.io/plant-shop
echo.
echo Для активації GitHub Pages:
echo 1. Перейдіть в налаштування репозиторію (Settings)
echo 2. Виберіть "Pages" в меню зліва
echo 3. В Source виберіть "Deploy from a branch"
echo 4. В Branch виберіть "main" і "/ (root)"
echo 5. Натисніть "Save"
echo.
echo Сайт стане доступним через кілька хвилин!
echo.
pause 