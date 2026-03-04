/**
 * Утиліти і допоміжні функції
 * Спільні функції для форматування, безпеки тексту, та інші helpers
 */

// DOM helper
function q(id) {
  return document.getElementById(id);
}

/**
 * Форматування суми в гривні
 * @param {number} value - Число для форматування
 * @returns {string} - Форматована сума (100 грн)
 */
function formatUAH(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString("uk-UA")} ₴`;
}

/**
 * Безпечне виведення тексту (видалення небезпечних символів)
 * @param {string} str - Текст для очищення
 * @returns {string} - Очищений текст
 */
function safeText(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[c]));
}

/**
 * Отримання акційної або звичайної ціни
 * @param {object} plant - Об'єкт рослини
 * @returns {number} - Ціна
 */
function getEffectivePrice(plant) {
  return plant && plant.promoPrice ? Number(plant.promoPrice) : Number(plant.price || 0);
}

/**
 * Розрахунок відсотку знижки
 * @param {object} plant - Об'єкт рослини
 * @returns {number} - Відсоток знижки
 */
function calcDiscountPercent(plant) {
  const price = Number(plant?.price || 0);
  const promo = Number(plant?.promoPrice || 0);
  if (!price || !promo || promo >= price) return 0;
  return Math.round(((price - promo) / price) * 100);
}

/**
 * Отримання мета-інформації про категорію
 * @param {string} category - ID категорії
 * @returns {object} - {label, icon}
 */
function getCategoryMeta(category) {
  const map = {
    all: { label: "Всі", icon: "fa-home" },
    indoor: { label: "Кімнатні", icon: "fa-leaf" },
    garden: { label: "Садові", icon: "fa-tree" },
    exotic: { label: "Екзотичні", icon: "fa-palm-tree" },
  };

  if (map[category]) return map[category];

  // fallback: red
  const pretty = String(category || "")
    .replace(/[_-]+/g, " ")
    .trim();
  return {
    label: pretty ? pretty[0].toUpperCase() + pretty.slice(1) : "Категорія",
    icon: "fa-tags"
  };
}

/**
 * Отримання назви способу доставки
 * @param {string} value - Значення способу доставки
 * @returns {string} - Назва способу
 */
function getDeliveryLabel(value) {
  const map = {
    nova_poshta: "Нова пошта",
    ukrposhta: "Укрпошта",
    courier: "Кур'єр / адресна",
    pickup: "Самовивіз",
  };
  return map[value] || "—";
}

/**
 * Показати тимчасове сповіщення
 * @param {string} message - Текст повідомлення
 * @param {string} type - 'success' або 'error'
 */
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = "notification";
  const bg = type === "error" ? "#c82333" : "#2e7d32";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bg};
    color: white;
    padding: 14px 18px;
    border-radius: 12px;
    z-index: 5000;
    box-shadow: 0 10px 28px rgba(0,0,0,0.18);
    max-width: min(420px, calc(100% - 40px));
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 2800);
}

/**
 * Копіювання тексту в буфер обміну
 * @param {string} text - Текст для копіювання
 * @returns {Promise<boolean>} - true якщо успішно
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Перевірка доступності Firebase
 * @returns {boolean}
 */
function hasFirebase() {
  return (
    typeof window.db !== "undefined" &&
    window.db &&
    typeof window.db.collection === "function"
  );
}

/**
 * Перевірка чи це зображення у форматі data URI
 * @param {string} image - Посилання на зображення
 * @returns {boolean}
 */
function isImageDataUrl(image) {
  return image && String(image).startsWith("data:image");
}

// Export для модулів
window.Utils = {
  q,
  formatUAH,
  safeText,
  getEffectivePrice,
  calcDiscountPercent,
  getCategoryMeta,
  getDeliveryLabel,
  showNotification,
  copyToClipboard,
  hasFirebase,
  isImageDataUrl
};
