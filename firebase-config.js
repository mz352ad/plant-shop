// Firebase configuration for PlantShop
const firebaseConfig = {
  apiKey: "AIzaSyC1WjIdVum2HB1AQEXeeCc41gFB3_Mk2eI",
  authDomain: "plant-shop-35729.firebaseapp.com",
  projectId: "plant-shop-35729",
  storageBucket: "plant-shop-35729.firebasestorage.app",
  messagingSenderId: "244151197000",
  appId: "1:244151197000:web:3e7681e1aba905f556e77d",
  measurementId: "G-J9L9MGKLKH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const auth = firebase.auth();

// Export for use in other files
window.db = db;
window.auth = auth; 