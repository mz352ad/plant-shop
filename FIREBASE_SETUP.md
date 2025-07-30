# 🔥 Налаштування Firebase для PlantShop

## ⚠️ **ВАЖЛИВО: Виправлення помилки API ключа**

Якщо ви бачите помилку `"API key not valid"`, це означає що потрібно оновити конфігурацію Firebase.

## 🔧 **Крок 1: Отримання правильного API ключа**

1. **Відкрийте [Firebase Console](https://console.firebase.google.com)**
2. **Виберіть ваш проект** (або створіть новий)
3. **Перейдіть в налаштування проекту:**
   - Натисніть на шестерню ⚙️ біля "Project Overview"
   - Виберіть "Project settings"
4. **Скопіюйте конфігурацію:**
   - Прокрутіть до розділу "Your apps"
   - Якщо немає веб-додатку, натисніть "Add app" → "Web"
   - Скопіюйте `firebaseConfig` об'єкт

## 🔧 **Крок 2: Оновлення firebase-config.js**

Замініть вміст файлу `firebase-config.js` на ваші дані:

```javascript
// Firebase configuration for PlantShop
const firebaseConfig = {
  apiKey: "ВАШ_API_КЛЮЧ",
  authDomain: "ВАШ_ПРОЕКТ.firebaseapp.com",
  projectId: "ВАШ_ПРОЕКТ_ID",
  storageBucket: "ВАШ_ПРОЕКТ.firebasestorage.app",
  messagingSenderId: "ВАШ_SENDER_ID",
  appId: "ВАШ_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Export for use in other files
window.db = db;
window.auth = auth;
```

## 🔧 **Крок 3: Налаштування Firestore Database**

1. **Створіть базу даних:**
   - В Firebase Console перейдіть в "Firestore Database"
   - Натисніть "Create database"
   - Виберіть "Start in test mode"
   - Виберіть регіон `europe-west1` (для України)

2. **Налаштуйте правила безпеки:**
   - Перейдіть на вкладку "Rules"
   - Замініть правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Дозволити читання всім
    match /plants/{document} {
      allow read: if true;
      allow write: if true; // Тимчасово для тестування
    }
  }
}
```

3. **Натисніть "Publish"**

## 🧪 **Крок 4: Тестування**

1. **Оновіть сторінку** в браузері
2. **Перевірте консоль** (F12) - не повинно бути помилок
3. **Спробуйте додати рослину** через адмін-панель
4. **Перевірте в Firebase Console** - рослина повинна з'явитися

## 🔒 **Безпека (для продакшену)**

Після тестування замініть правила на більш безпечні:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /plants/{document} {
      allow read: if true;
      allow write: if request.auth != null; // Тільки авторизовані користувачі
    }
  }
}
```

## 🆘 **Якщо проблеми залишаються**

1. **Перевірте API ключ** - він повинен бути правильним
2. **Перевірте домен** - додайте ваш домен в Firebase Console
3. **Очистіть кеш браузера** (Ctrl+F5)
4. **Перевірте мережу** - переконайтеся що немає блокування

## 📞 **Підтримка**

Якщо у вас є питання:
1. Перевірте [Firebase документацію](https://firebase.google.com/docs)
2. Створіть Issue в репозиторії
3. Зверніться до Firebase підтримки

---

**🌿 PlantShop** - тепер з повною Firebase інтеграцією! 🚀 