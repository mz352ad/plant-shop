# 🔥 Налаштування Firebase для PlantShop

## 🎯 **Мета: Синхронізація між пристроями**

Цей гід допоможе налаштувати Firebase так, щоб рослини, додані на одному пристрої, з'являлися на всіх інших пристроях.

## 🔧 **Крок 1: Створення Firebase проекту**

1. **Перейдіть на [Firebase Console](https://console.firebase.google.com)**
2. **Натисніть "Create a project"**
3. **Введіть назву проекту:** `plant-shop` (або будь-яку іншу)
4. **Відключіть Google Analytics** (не потрібно для початку)
5. **Натисніть "Create project"**

## 🔧 **Крок 2: Додавання веб-додатку**

1. **На головній сторінці проекту натисніть веб-іконку** (</>)
2. **Введіть назву додатку:** `PlantShop Web`
3. **Можна відключити Firebase Hosting** (не потрібно)
4. **Натисніть "Register app"**
5. **Скопіюйте конфігурацію** (firebaseConfig об'єкт)

## 🔧 **Крок 3: Оновлення firebase-config.js**

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

console.log('Firebase успішно ініціалізований');
```

## 🔧 **Крок 4: Налаштування Firestore Database**

1. **В лівому меню натисніть "Firestore Database"**
2. **Натисніть "Create database"**
3. **Виберіть "Start in test mode"** (для початку)
4. **Виберіть регіон:** `europe-west1` (для України)
5. **Натисніть "Done"**

## 🔧 **Крок 5: Налаштування правил безпеки**

1. **Перейдіть на вкладку "Rules"**
2. **Замініть правила на:**

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

## 🔧 **Крок 6: Включення Firebase SDK**

Розкоментуйте Firebase SDK в `index.html`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
```

## 🧪 **Крок 7: Тестування синхронізації**

1. **Оновіть сторінку** в браузері
2. **Відкрийте адмін-панель** і додайте рослину
3. **Перевірте в Firebase Console** - рослина повинна з'явитися
4. **Відкрийте сайт на іншому пристрої** - рослина повинна з'явитися

## 📱 **Тестування на різних пристроях**

### **Сценарій 1: Комп'ютер → Телефон**
1. Додайте рослину на комп'ютері
2. Відкрийте сайт на телефоні
3. Рослина повинна з'явитися

### **Сценарій 2: Телефон → Комп'ютер**
1. Додайте рослину на телефоні
2. Відкрийте сайт на комп'ютері
3. Рослина повинна з'явитися

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

## 🆘 **Якщо проблеми**

### **Помилка "API key not valid"**
- Перевірте, чи правильно скопійований API ключ
- Переконайтеся, що проект створений правильно

### **Дані не зберігаються**
- Перевірте правила Firestore
- Перевірте консоль браузера на помилки

### **Синхронізація не працює**
- Переконайтеся, що Firebase SDK підключений
- Перевірте мережеве з'єднання

## 📞 **Підтримка**

Якщо у вас є питання:
1. Перевірте [Firebase документацію](https://firebase.google.com/docs)
2. Створіть Issue в репозиторії
3. Зверніться до Firebase підтримки

---

**🌿 PlantShop** - тепер з повною синхронізацією між пристроями! 🚀 