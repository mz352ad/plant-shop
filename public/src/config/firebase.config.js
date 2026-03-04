/**
 * Firebase Configuration
 */

const params = new URLSearchParams(location.search);
const isLocalHost = location.hostname === "127.0.0.1" || location.hostname === "localhost";
const useEmu = params.get("emu") === "1" || isLocalHost;

// PROD
const firebaseConfigProd = {
  apiKey: "AIzaSyC1WjIdVum2HBlAQEXeeCc41gFB3_Mk2eI",
  authDomain: "plant-shop-35729.firebaseapp.com",
  projectId: "plant-shop-35729",
  storageBucket: "plant-shop-35729.firebasestorage.app",
  messagingSenderId: "244151197000",
  appId: "1:244151197000:web:3e7681e1aba905f556e77d",
  measurementId: "G-J9L9MGKLKH"
};

// LOCAL (для емулятора)
const firebaseConfigLocal = {
  apiKey: "fake-api-key",
  authDomain: "localhost",
  projectId: "plant-shop-local"
};

firebase.initializeApp(useEmu ? firebaseConfigLocal : firebaseConfigProd);

const db = firebase.firestore();
const auth = firebase.auth();

if (useEmu) {
  console.log("🔧 Using Firebase emulators");
  auth.useEmulator("http://127.0.0.1:9099");
  db.useEmulator("127.0.0.1", 8080);
}

window.db = db;
window.auth = auth;

console.log("✅ Firebase init OK. useEmu =", useEmu);