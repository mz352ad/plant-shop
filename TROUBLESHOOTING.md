# 🔧 Вирішення проблем з відображенням

## Проблема: Різне відображення локально та на GitHub Pages

### Причини та рішення:

#### 1. **Кешування браузера** ⚡
**Проблема:** Браузер кешує старі версії файлів
**Рішення:**
- Натисніть `Ctrl + F5` (або `Cmd + Shift + R` на Mac) для примусового оновлення
- Очистіть кеш браузера: `Ctrl + Shift + Delete`
- Відкрийте сайт в режимі інкогніто

#### 2. **Версії файлів** 📝
**Додано версії до всіх файлів:**
- `styles.css?v=1.1`
- `script.js?v=1.1`
- `firebase-config.js?v=1.1`
- `admin.js?v=1.1`

#### 3. **Мета-теги для запобігання кешування** 🚫
Додано в `index.html` та `admin.html`:
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

#### 4. **Діагностика** 🔍
Створено файл `test.html` для перевірки завантаження:
1. Відкрийте `http://localhost:8000/test.html` локально
2. Відкрийте `https://your-username.github.io/plant-shop/test.html` на GitHub Pages
3. Порівняйте результати

#### 5. **Консоль браузера** 💻
Відкрийте Developer Tools (`F12`) і перевірте:
- **Console** - помилки JavaScript
- **Network** - чи завантажуються файли
- **Application** - кеш та localStorage

#### 6. **Firebase налаштування** 🔥
Перевірте в Firebase Console:
- **Authentication** → **Settings** → **Authorized domains**
- Додайте: `your-username.github.io`

#### 7. **Порядок завантаження** 📋
Файли завантажуються в такому порядку:
1. Firebase SDK
2. `firebase-config.js`
3. `script.js` або `admin.js`
4. `styles.css`

### Швидкі перевірки:

#### ✅ Локальне тестування:
```bash
python -m http.server 8000
# Відкрийте http://localhost:8000
```

#### ✅ GitHub Pages:
1. Зробіть commit та push змін
2. Зачекайте 2-5 хвилин
3. Відкрийте `https://your-username.github.io/plant-shop`

#### ✅ Примусове оновлення:
- `Ctrl + F5` - оновлення без кешу
- `Ctrl + Shift + R` - примусове оновлення
- Режим інкогніто - тестування без кешу

### Логування для діагностики:

Додано консольне логування в `script.js`:
- Завантаження файлів
- Firebase ініціалізація
- DOM елементи
- Завантаження даних

### Якщо проблема залишається:

1. **Перевірте test.html** - чи всі файли завантажуються
2. **Порівняйте консолі** - локально vs GitHub Pages
3. **Перевірте Network tab** - чи є помилки 404
4. **Очистіть кеш** - браузера та GitHub Pages
5. **Зробіть новий commit** - з іншими версіями файлів

### Контакти для підтримки:
- Відкрийте Developer Tools (`F12`)
- Перейдіть на вкладку Console
- Скопіюйте всі помилки та повідомлення
- Надішліть для аналізу 