#!/bin/bash

echo "========================================"
echo "    PlantShop - GitHub Pages Deploy"
echo "========================================"
echo

# Перевірка наявності Git
if ! command -v git &> /dev/null; then
    echo "[ПОМИЛКА] Git не встановлений!"
    echo "Завантажте Git з: https://git-scm.com/"
    echo
    read -p "Натисніть Enter для виходу..."
    exit 1
fi

echo "[OK] Git знайдено"
echo

# Перевірка чи це Git репозиторій
if [ ! -d ".git" ]; then
    echo "[ІНФО] Ініціалізація Git репозиторію..."
    git init
    if [ $? -ne 0 ]; then
        echo "[ПОМИЛКА] Не вдалося ініціалізувати Git репозиторій"
        read -p "Натисніть Enter для виходу..."
        exit 1
    fi
fi

echo "[ІНФО] Додавання файлів до Git..."
git add .

echo "[ІНФО] Створення коміту..."
git commit -m "PlantShop website update - $(date)"

echo
echo "========================================"
echo "    Налаштування GitHub репозиторію"
echo "========================================"
echo
echo "Для продовження вам потрібно:"
echo "1. Створити репозиторій на GitHub.com"
echo "2. Назвати його \"plant-shop\""
echo "3. Зробити публічним"
echo "4. Скопіювати URL репозиторію"
echo

read -p "Введіть URL вашого GitHub репозиторію (наприклад, https://github.com/username/plant-shop.git): " repo_url

if [ -z "$repo_url" ]; then
    echo "[ПОМИЛКА] URL репозиторію не вказано"
    read -p "Натисніть Enter для виходу..."
    exit 1
fi

echo
echo "[ІНФО] Додавання віддаленого репозиторію..."
git remote add origin "$repo_url"

echo "[ІНФО] Перейменування гілки на main..."
git branch -M main

echo "[ІНФО] Відправка файлів на GitHub..."
git push -u origin main

if [ $? -ne 0 ]; then
    echo
    echo "[ПОМИЛКА] Не вдалося відправити файли на GitHub"
    echo "Можливі причини:"
    echo "- Неправильний URL репозиторію"
    echo "- Проблеми з автентифікацією"
    echo "- Репозиторій не створений"
    echo
    read -p "Натисніть Enter для виходу..."
    exit 1
fi

echo
echo "========================================"
echo "    УСПІШНО РОЗГОРНУТО!"
echo "========================================"
echo
echo "Ваш сайт буде доступний за адресою:"
# Видаляємо https://github.com/ і .git з URL
username=$(echo "$repo_url" | sed 's|https://github.com/||' | sed 's|/plant-shop.git||')
echo "https://$username.github.io/plant-shop"
echo
echo "Для активації GitHub Pages:"
echo "1. Перейдіть в налаштування репозиторію (Settings)"
echo "2. Виберіть \"Pages\" в меню зліва"
echo "3. В Source виберіть \"Deploy from a branch\""
echo "4. В Branch виберіть \"main\" і \"/ (root)\""
echo "5. Натисніть \"Save\""
echo
echo "Сайт стане доступним через кілька хвилин!"
echo
read -p "Натисніть Enter для виходу..." 