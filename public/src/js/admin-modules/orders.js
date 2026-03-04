/**
 * Orders Admin Module
 * Управління замовленнями в адмін-панелі
 */

let ordersData = [];
let ordersUnsub = null;

// DOM
const ordersList = document.getElementById("ordersList");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const orderSearch = document.getElementById("orderSearch");
const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

const FIXED_VIBER = "+380966970439";
const FIXED_TELEGRAM = "+380966970439";

/**
 * Форматувати гривні
 * @param {number} value
 * @returns {string}
 */
function formatUAH(value) {
  const n = Number(value || 0);
  return `${n.toLocaleString("uk-UA")} ₴`;
}

/**
 * Безпечно екранізувати текст
 * @param {*} str
 * @returns {string}
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
 * Санітизувати телефон для посилання tel:
 * залишає тільки цифри та + (інші символи прибирає)
 * @param {*} str
 * @returns {string}
 */
function safeTel(str) {
  const raw = String(str ?? "");
  const cleaned = raw.replace(/[^0-9+]/g, "");
  // tel: з порожнім значенням не робимо
  return cleaned;
}

/**
 * Показати повідомлення
 * @param {string} message
 * @param {string} type - 'success' або 'error'
 */
function showMessage(message, type = "success") {
  const messageContainer = document.getElementById("message-container");
  if (!messageContainer) return;
  messageContainer.innerHTML = `
      <div class="message ${type}">
          <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
          ${message}
      </div>
  `;
  setTimeout(() => (messageContainer.innerHTML = ""), 5000);
}

/**
 * Отримати статус мітку
 * @param {string} status
 * @returns {string}
 */
function getStatusLabel(status) {
  const map = {
    new: "Нові",
    processing: "В роботі",
    done: "Виконані",
    canceled: "Скасовані",
  };
  return map[status] || status;
}

/**
 * Завантажити замовлення один раз (одноразово)
 */
async function loadOrdersOnce() {
  if (!window.db) {
    console.warn("Firebase not available");
    return;
  }

  try {
    const snapshot = await window.db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();
    ordersData = [];
    snapshot.forEach((doc) => ordersData.push({ id: doc.id, ...doc.data() }));
    renderOrders();
  } catch (error) {
    console.error("Помилка завантаження замовлень:", error);
    showMessage("Помилка завантаження замовлень", "error");
  }
}

/**
 * Підписатися на оновлення замовлень (live subscription)
 */
function subscribeToOrders() {
  if (!window.db) {
    console.warn("Firebase not available");
    return;
  }

  if (ordersUnsub) {
    ordersUnsub();
  }

  ordersUnsub = window.db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        ordersData = [];
        snapshot.forEach((doc) => ordersData.push({ id: doc.id, ...doc.data() }));
        renderOrders();
      },
      (error) => {
        console.error("Помилка підписки замовлень:", error);
        showMessage("Помилка відслідковування замовлень", "error");
      }
    );
}

/**
 * Отримати фільтровані замовлення
 * @returns {array}
 */
function getFilteredOrders() {
  let filtered = [...ordersData];

  // Фільтр статусу
  const statusFilter = orderStatusFilter?.value || "all";
  if (statusFilter !== "all") {
    filtered = filtered.filter((o) => o.status === statusFilter);
  }

  // Пошук
  const searchQuery = (orderSearch?.value || "").toLowerCase().trim();
  if (searchQuery) {
    filtered = filtered.filter((o) => {
      const name = String(o.customer?.name || "").toLowerCase();
      const phone = String(o.customer?.phone || "").toLowerCase();
      const id = String(o.id || "").toLowerCase();
      return name.includes(searchQuery) || phone.includes(searchQuery) || id.includes(searchQuery);
    });
  }

  return filtered;
}

/**
 * Рендерити замовлення
 */
function renderOrders() {
  if (!ordersList) return;

  const filtered = getFilteredOrders();

  if (!filtered.length) {
    ordersList.innerHTML = `
      <div class="no-results">
          <i class="fas fa-inbox" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
          <h3>Замовлення не знайдено</h3>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = "";

  filtered.forEach((o) => {
    const card = document.createElement("div");
    card.className = "order-card";

    const createdAt = o.createdAt
      ? new Date(o.createdAt.toDate ? o.createdAt.toDate() : o.createdAt).toLocaleString("uk-UA")
      : "—";

    const itemsHtml =
      o.items && Array.isArray(o.items)
        ? o.items
            .map(
              (item) =>
                `<div class="order-item">
              <span class="item-name">${safeText(item.name)}</span>
              <span class="item-qty">${item.quantity}×</span>
              <span class="item-price">${formatUAH(item.price)}</span>
            </div>`
            )
            .join("")
        : "";

    card.innerHTML = `
      <div class="order-header">
        <div>
          <h4 class="order-id">${safeText(o.id)}</h4>
          <span class="order-date">${createdAt}</span>
        </div>
        <div class="order-actions">
          <select class="order-status" data-id="${safeText(o.id)}">
            <option value="new" ${o.status === "new" ? "selected" : ""}>Нові</option>
            <option value="processing" ${o.status === "processing" ? "selected" : ""}>В роботі</option>
            <option value="done" ${o.status === "done" ? "selected" : ""}>Виконані</option>
            <option value="canceled" ${o.status === "canceled" ? "selected" : ""}>Скасовані</option>
          </select>
          <button class="btn btn-danger" data-del="${safeText(o.id)}" type="button"><i class="fas fa-trash"></i></button>
        </div>
      </div>

      <div class="order-body">
        <div class="order-cols">
          <div>
            <div><b>Ім'я:</b> ${safeText(o.customer?.name || "—")}</div>
            <div><b>Телефон:</b> <a href="tel:${safeTel(o.customer?.phone || "")}">${safeText(o.customer?.phone || "—")}</a></div>
            ${o.customer?.city ? `<div><b>Місто:</b> ${safeText(o.customer.city)}</div>` : ""}
          </div>
          <div>
            <div><b>Доставка:</b> ${safeText(o.delivery?.method || "—")}</div>
            ${o.delivery?.address ? `<div><b>Адреса:</b> ${safeText(o.delivery.address)}</div>` : ""}
          </div>
        </div>

        <div class="order-items">
          ${itemsHtml || `<span class="muted">(позиції відсутні)</span>`}
        </div>

        <div class="order-foot">
          <div class="muted">${o.comment ? `Коментар: ${safeText(o.comment)}` : ""}</div>
          <div class="order-sum"><b>Разом:</b> ${formatUAH(o.total)}</div>
        </div>
      </div>
    `;

    ordersList.appendChild(card);
  });

  // Events: status updates + delete
  ordersList.querySelectorAll(".order-status").forEach((sel) => {
    sel.addEventListener("change", async () => {
      const id = sel.getAttribute("data-id");
      const status = String(sel.value);
      try {
        await window.db.collection("orders").doc(id).set(
          {
            status,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error(e);
        showMessage("Не вдалося оновити статус (перевірте правила)", "error");
      }
    });
  });

  ordersList.querySelectorAll("button[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-del");
      if (!confirm("Видалити замовлення назавжди?")) return;
      try {
        await window.db.collection("orders").doc(id).delete();
      } catch (e) {
        console.error(e);
        showMessage("Не вдалося видалити замовлення", "error");
      }
    });
  });
}

/**
 * Оновити статус замовлення
 * @param {string} orderId
 * @param {string} status
 */
async function updateOrderStatus(orderId, status) {
  if (!window.db) return;

  try {
    await window.db.collection("orders").doc(orderId).set(
      {
        status,
        updatedAt: window.firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Помилка оновлення статусу:", e);
    showMessage("Не вдалося оновити статус", "error");
  }
}

/**
 * Видалити замовлення
 * @param {string} orderId
 */
async function deleteOrder(orderId) {
  if (!window.db) return;

  if (!confirm("Видалити замовлення назавжди?")) return;

  try {
    await window.db.collection("orders").doc(orderId).delete();
    showMessage("Замовлення видалено");
  } catch (e) {
    console.error("Помилка видалення:", e);
    showMessage("Не вдалося видалити замовлення", "error");
  }
}

/**
 * Очистити підписку (при розлогіненні)
 */
function unsubscribeFromOrders() {
  if (ordersUnsub) {
    ordersUnsub();
    ordersUnsub = null;
  }
}

// Export
window.AdminOrdersModule = {
  loadOrdersOnce,
  subscribeToOrders,
  unsubscribeFromOrders,
  renderOrders,
  getFilteredOrders,
  updateOrderStatus,
  deleteOrder,
  showMessage,
};
