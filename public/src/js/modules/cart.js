/**
 * Cart Module
 * Управління кошиком покупок, зберігання в localStorage
 */

let cart = [];

/**
 * Завантажити кошик з localStorage
 */
function loadCartFromStorage() {
  const savedCart = localStorage.getItem("cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
}

/**
 * Зберегти кошик у localStorage
 */
function saveCartToStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * Отримати поточний кошик
 * @returns {array}
 */
function getCart() {
  return [...cart];
}

/**
 * Очистити кошик
 */
function clearCart() {
  cart = [];
  saveCartToStorage();
}

/**
 * Додати товар у кошик
 * @param {string} plantId - ID рослини
 * @param {object} plantData - Дані рослини
 */
function addToCart(plantId, plantData) {
  if (!plantData) return;

  const existing = cart.find((i) => String(i.id) === String(plantId));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: plantData.id,
      name: plantData.name,
      price: Utils.getEffectivePrice(plantData),
      originalPrice: Number(plantData.price || 0),
      promoPrice: plantData.promoPrice ? Number(plantData.promoPrice) : null,
      image: plantData.image,
      quantity: 1,
    });
  }

  saveCartToStorage();
  Utils.showNotification("Додано у кошик!");
}

/**
 * Оновити кількість товару
 * @param {string} plantId - ID рослини
 * @param {number} change - Зміна кількості (+1 або -1)
 */
function updateQuantity(plantId, change) {
  const item = cart.find((i) => String(i.id) === String(plantId));
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter((i) => String(i.id) !== String(plantId));
  }

  saveCartToStorage();
}

/**
 * Видалити товар з кошика
 * @param {string} plantId - ID рослини
 */
function removeFromCart(plantId) {
  cart = cart.filter((i) => String(i.id) !== String(plantId));
  saveCartToStorage();
}

/**
 * Отримати загальну кількість товарів
 * @returns {number}
 */
function getCartItemsCount() {
  return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

/**
 * Отримати загальну суму
 * @returns {number}
 */
function getCartTotal() {
  return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
}

/**
 * Побудувати текст замовлення з даних кошика
 * @param {object} formValues - {name, phone, city, delivery, address, comment}
 * @returns {string} - Форматований текст замовлення
 */
function buildOrderMessageFromCart(formValues) {
  const total = getCartTotal();
  const itemsPlain = cart
    .map(
      (i, idx) =>
        `${idx + 1}) ${i.name} — ${i.quantity} шт × ${Utils.formatUAH(i.price)} = ${Utils.formatUAH(i.price * i.quantity)}`
    )
    .join("\n");

  const lines = [
    "Замовлення Inna-Flowers:",
    "",
    itemsPlain,
    "",
    `Разом: ${Utils.formatUAH(total)}`,
    "",
    `Ім'я: ${formValues.name || "—"}`,
    `Телефон: ${formValues.phone || "—"}`,
    formValues.city ? `Місто: ${formValues.city}` : null,
    `Доставка: ${Utils.getDeliveryLabel(formValues.delivery)}`,
    formValues.address ? `Адреса/відділення: ${formValues.address}` : null,
    formValues.comment ? `Коментар: ${formValues.comment}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

// Export модуля
window.CartModule = {
  loadCartFromStorage,
  saveCartToStorage,
  getCart,
  clearCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  getCartItemsCount,
  getCartTotal,
  buildOrderMessageFromCart
};
