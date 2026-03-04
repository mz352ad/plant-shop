/**
 * Auth Module for Admin Panel
 * Управління автентифікацією адміністратора
 */

// IMPORTANT: This list is only for UX (real security must be done with Firebase Rules)
// Put your admin emails here (example: ["admin@gmail.com"]).
const ADMIN_EMAILS = [];

// DOM Elements
const authGate = document.getElementById("authGate");
const adminApp = document.getElementById("adminApp");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const authError = document.getElementById("authError");
const authUser = document.getElementById("authUser");
const logoutBtn = document.getElementById("logoutBtn");

/**
 * Перевірити наявність Firebase Auth
 * @returns {boolean}
 */
function hasAuth() {
  return (
    typeof window.auth !== "undefined" &&
    window.auth &&
    typeof window.auth.onAuthStateChanged === "function"
  );
}

/**
 * Показати екран входу
 * @param {string} message - Повідомлення про помилку
 */
function showAuthGate(message = "") {
  if (adminApp) adminApp.style.display = "none";
  if (authGate) authGate.style.display = "flex";
  if (authError) {
    if (message) {
      authError.textContent = message;
      authError.style.display = "block";
    } else {
      authError.textContent = "";
      authError.style.display = "none";
    }
  }
}

/**
 * Показати основне інтерфейс адмін-панелі
 * @param {Object} user - Об'єкт користувача Firebase
 */
function showAdminApp(user) {
  if (authGate) authGate.style.display = "none";
  if (adminApp) adminApp.style.display = "block";
  if (authUser) {
    const email = user?.email || "";
    const uid = user?.uid || "";
    authUser.textContent = email
      ? `${email}${uid ? ` · ${uid}` : ""}`
      : uid || "—";
  }
}

/**
 * Обробити вхід через email/password
 * @param {string} email
 * @param {string} password
 */
async function handleLogin(email, password) {
  if (!hasAuth()) {
    showAuthGate("Firebase Auth не доступний");
    return;
  }

  try {
    const userCredential = await window.auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Optional: Check if user is in ADMIN_EMAILS (client-side only - not security)
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(user.email)) {
      await window.auth.signOut();
      showAuthGate("У вас немає доступу до адмін-панелі");
      return;
    }

    showAdminApp(user);
  } catch (error) {
    console.error("Помилка входу:", error);
    showAuthGate(error.message || "Помилка входу");
  }
}

/**
 * Обробити вихід
 */
async function handleLogout() {
  if (!hasAuth()) {
    showAuthGate("Firebase Auth не доступний");
    return;
  }

  try {
    await window.auth.signOut();
    showAuthGate();
  } catch (error) {
    console.error("Помилка виходу:", error);
  }
}

/**
 * Ініціалізувати слухач автентифікації
 * Викликається при завантаженні сторінки
 */
function initAuthListener() {
  if (!hasAuth()) {
    console.warn("Firebase Auth не доступний");
    showAuthGate("Firebase не налаштований");
    return;
  }

  window.auth.onAuthStateChanged((user) => {
    if (user) {
      showAdminApp(user);
    } else {
      showAuthGate();
    }
  });
}

/**
 * Налаштувати обробники подій для форми входу
 */
function setupAuthEventListeners() {
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = (loginEmail?.value || "").trim();
      const password = loginPassword?.value || "";
      handleLogin(email, password);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

// Export
window.AdminAuthModule = {
  hasAuth,
  showAuthGate,
  showAdminApp,
  handleLogin,
  handleLogout,
  initAuthListener,
  setupAuthEventListeners,
};
