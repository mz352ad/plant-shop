// Firebase configuration for PlantShop
// ТИМЧАСОВА КОНФІГУРАЦІЯ - замініть на ваші дані з Firebase Console

// Перевіряємо, чи Firebase доступний
if (typeof firebase !== 'undefined') {
    const firebaseConfig = {
        apiKey: "AIzaSyC1WjIdVum2HB1AQEXeeCc41gFB3_Mk2eI",
        authDomain: "plant-shop-35729.firebaseapp.com",
        projectId: "plant-shop-35729",
        storageBucket: "plant-shop-35729.firebasestorage.app",
        messagingSenderId: "244151197000",
        appId: "1:244151197000:web:3e7681e1aba905f556e77d",
        measurementId: "G-J9L9MGKLKH"
    };

    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);

        // Initialize Firebase services
        const db = firebase.firestore();
        const auth = firebase.auth();

        // Export for use in other files
        window.db = db;
        window.auth = auth;
        
        console.log('Firebase успішно ініціалізований');
    } catch (error) {
        console.error('Помилка ініціалізації Firebase:', error);
        console.log('Використовуємо localStorage замість Firebase');
    }
} else {
    console.log('Firebase SDK не завантажений, використовуємо localStorage');
}

// Fallback об'єкти для випадку, коли Firebase недоступний
if (typeof window.db === 'undefined') {
    window.db = {
        collection: (name) => ({
            get: async () => ({ forEach: () => {} }),
            add: async (data) => ({ id: Date.now().toString() }),
            doc: (id) => ({
                update: async (data) => true,
                delete: async () => true
            })
        })
    };
    console.log('Використовуємо fallback для Firebase');
} 