/**
 * Orders Module
 * Управління замовленнями, відправка у Firestore та месенджери
 */

/**
 * Надіслати замовлення у Firestore
 * @param {object} formValues - Дані форми
 * @returns {Promise<string>} - ID замовлення
 */
async function submitOrderToFirestore(formValues) {
  if (!Utils.hasFirebase()) {
    throw new Error("Firebase не доступний");
  }

  const cart = window.CartModule.getCart();
  const total = window.CartModule.getCartTotal();

  const items = cart.map((i) => ({
    id: String(i.id),
    name: String(i.name || ""),
    quantity: Number(i.quantity || 0),
    price: Number(i.price || 0),
  }));

  const payload = {
    status: "new",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    customer: {
      name: String(formValues.name || "").trim(),
      phone: String(formValues.phone || "").trim(),
      city: String(formValues.city || "").trim(),
    },
    delivery: {
      method: String(formValues.delivery || "nova_poshta"),
      address: String(formValues.address || "").trim(),
    },
    comment: String(formValues.comment || "").trim(),
    total: Number(total || 0),
    currency: "UAH",
    items,
    meta: {
      source: "web",
      userAgent: navigator.userAgent,
      href: location.href,
    },
  };

  const docRef = await window.db.collection("orders").add(payload);
  return docRef.id;
}

/**
 * Отримати список замовлень (адмін-панель)
 * @returns {Promise<array>}
 */
async function getOrdersFromFirestore() {
  if (!Utils.hasFirebase()) {
    throw new Error("Firebase не доступний");
  }

  const snapshot = await window.db.collection("orders").orderBy("createdAt", "desc").get();
  const orders = [];

  snapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });

  return orders;
}

/**
 * Оновити статус замовлення
 * @param {string} orderId - ID замовлення
 * @param {string} newStatus - Новий статус
 */
async function updateOrderStatus(orderId, newStatus) {
  if (!Utils.hasFirebase()) {
    throw new Error("Firebase не доступний");
  }

  await window.db.collection("orders").doc(orderId).update({
    status: String(newStatus).trim(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Видалити замовлення
 * @param {string} orderId - ID замовлення
 */
async function deleteOrder(orderId) {
  if (!Utils.hasFirebase()) {
    throw new Error("Firebase не доступний");
  }

  await window.db.collection("orders").doc(orderId).delete();
}

/**
 * Надіслати замовлення через Telegram (без Firebase)
 * @param {string} message - Текст повідомлення
 * @param {object} contacts - {telegramShareUrl}
 */
function sendViaTelegramShare(message, contacts = {}) {
  const telegramShareUrl = contacts.telegramShareUrl || "https://t.me/share/url";
  const msgEncoded = encodeURIComponent(message);

  // Копіювати в буфер
  Utils.copyToClipboard(message).then((ok) => {
    if (ok) Utils.showNotification("Текст замовлення скопійовано ✅");
    else Utils.showNotification("Не вдалося скопіювати", "error");
  });

  // Відкрити Telegram share
  const tgUrl = `${telegramShareUrl}?text=${msgEncoded}`;
  window.open(tgUrl, "_blank");
}

/**
 * Надіслати замовлення через Viber
 * @param {string} phoneNumber - Номер телефону
 */
function sendViaViber(phoneNumber) {
  if (!phoneNumber) return;
  window.open(`viber://chat?number=${phoneNumber}`, "_blank");
}

/**
 * Отримати замовлення за ID
 * @param {string} orderId - ID замовлення
 * @returns {Promise<object|null>}
 */
async function getOrderById(orderId) {
  if (!Utils.hasFirebase()) {
    throw new Error("Firebase не доступний");
  }

  const doc = await window.db.collection("orders").doc(orderId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * Фільтрувати замовлення по статусу
 * @param {array} orders - Масив замовлень
 * @param {string} status - Статус для фільтрації
 * @returns {array}
 */
function filterOrdersByStatus(orders, status) {
  if (status === "all") return orders;
  return orders.filter((o) => o.status === status);
}

/**
 * Фільтрувати замовлення по пошуку (ім'я, телефон, ID)
 * @param {array} orders - Масив замовлень
 * @param {string} query - Пошуковий запит
 * @returns {array}
 */
function filterOrdersBySearch(orders, query) {
  const q = query.toLowerCase().trim();
  if (!q) return orders;

  return orders.filter((o) => {
    const name = String(o.customer?.name || "").toLowerCase();
    const phone = String(o.customer?.phone || "").toLowerCase();
    const id = String(o.id || "").toLowerCase();

    return name.includes(q) || phone.includes(q) || id.includes(q);
  });
}

// Export модуля
window.OrdersModule = {
  submitOrderToFirestore,
  getOrdersFromFirestore,
  updateOrderStatus,
  deleteOrder,
  sendViaTelegramShare,
  sendViaViber,
  getOrderById,
  filterOrdersByStatus,
  filterOrdersBySearch
};
