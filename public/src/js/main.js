/**
 * Main App Entry Point
 * Ініціалізація каталогу рослин
 */

// Константи контактів
const CONTACTS = {
  viberNumber: "+380966970439",
  telegramShareUrl: "https://t.me/share/url",
};

// DOM контейнери
const containers = {
  // Header & filters
  plantsGrid: null,
  categoriesContainer: null,
  resultsCount: null,
  sortSelect: null,
  clearFiltersBtn: null,

  // Search
  searchOverlay: null,
  searchBtn: null,
  closeSearch: null,
  searchInput: null,
  searchInputDesktop: null,

  // Plant modal
  plantModal: null,
  closeModal: null,
  plantDetails: null,

  // Cart
  cartBtn: null,
  cartDrawer: null,
  closeCart: null,
  cartItems: null,
  cartSummary: null,
  cartCountHeader: null,
  cartCountMobile: null,

  // Order modal
  orderModal: null,
  closeOrderModal: null,
  orderForm: null,
  orderSummary: null,
  orderHint: null,
  sendViaTelegramBtn: null,
  submitOrderBtn: null,

  // Menu drawer
  menuBtn: null,
  menuDrawer: null,
  closeMenu: null,
  menuGoHome: null,
  menuGoCart: null,
  viberLink: null,
  telegramLink: null,
  logoHome: null,

  // Tabs
  tabBtns: null,
};

/**
 * Ініціалізація DOM елементів
 */
function initializeDOMElements() {
  containers.plantsGrid = Utils.q("plantsGrid");
  containers.categoriesContainer = Utils.q("categoriesContainer");
  containers.resultsCount = Utils.q("resultsCount");
  containers.sortSelect = Utils.q("sortSelect");
  containers.clearFiltersBtn = Utils.q("clearFiltersBtn");

  containers.searchOverlay = Utils.q("searchOverlay");
  containers.searchBtn = Utils.q("searchBtn");
  containers.closeSearch = Utils.q("closeSearch");
  containers.searchInput = Utils.q("searchInput");
  containers.searchInputDesktop = Utils.q("searchInputDesktop");

  containers.plantModal = Utils.q("plantModal");
  containers.closeModal = Utils.q("closeModal");
  containers.plantDetails = Utils.q("plantDetails");

  containers.cartBtn = Utils.q("cartBtn");
  containers.cartDrawer = Utils.q("cartDrawer");
  containers.closeCart = Utils.q("closeCart");
  containers.cartItems = Utils.q("cartItems");
  containers.cartSummary = Utils.q("cartSummary");
  containers.cartCountHeader = Utils.q("cartCountHeader");
  containers.cartCountMobile = Utils.q("cartCount");

  containers.orderModal = Utils.q("orderModal");
  containers.closeOrderModal = Utils.q("closeOrderModal");
  containers.orderForm = Utils.q("orderForm");
  containers.orderSummary = Utils.q("orderSummary");
  containers.orderHint = Utils.q("orderHint");
  containers.sendViaTelegramBtn = Utils.q("sendViaTelegramBtn");
  containers.submitOrderBtn = Utils.q("submitOrderBtn");

  containers.menuBtn = Utils.q("menuBtn");
  containers.menuDrawer = Utils.q("menuDrawer");
  containers.closeMenu = Utils.q("closeMenu");
  containers.menuGoHome = Utils.q("menuGoHome");
  containers.menuGoCart = Utils.q("menuGoCart");
  containers.viberLink = Utils.q("viberLink");
  containers.telegramLink = Utils.q("telegramLink");
  containers.logoHome = Utils.q("logoHome");

  containers.tabBtns = document.querySelectorAll(".tab-btn");
}

/**
 * Налаштування слухачів подій
 */
function setupEventListeners() {
  // === SEARCH ===
  containers.searchBtn?.addEventListener("click", () => {
    containers.searchOverlay?.classList.add("active");
    containers.searchOverlay?.setAttribute("aria-hidden", "false");
    containers.searchInput?.focus();
  });

  containers.closeSearch?.addEventListener("click", () => {
    containers.searchOverlay?.classList.remove("active");
    containers.searchOverlay?.setAttribute("aria-hidden", "true");
    if (containers.searchInput) containers.searchInput.value = "";
    if (containers.searchInputDesktop) containers.searchInputDesktop.value = "";
    window.SearchModule.setSearchQuery("");
    renderResults();
  });

  containers.searchInput?.addEventListener("input", (e) => {
    window.SearchModule.setSearchQuery(String(e.target.value || ""));
    if (containers.searchInputDesktop)
      containers.searchInputDesktop.value = String(e.target.value || "");
    renderResults();
  });

  containers.searchInputDesktop?.addEventListener("input", (e) => {
    window.SearchModule.setSearchQuery(String(e.target.value || ""));
    if (containers.searchInput) containers.searchInput.value = String(e.target.value || "");
    renderResults();
  });

  // === SORT & FILTERS ===
  containers.sortSelect?.addEventListener("change", (e) => {
    window.SearchModule.setSort(String(e.target.value || "default"));
    renderResults();
  });

  containers.clearFiltersBtn?.addEventListener("click", () => {
    window.SearchModule.resetFilters();
    if (containers.searchInput) containers.searchInput.value = "";
    if (containers.searchInputDesktop) containers.searchInputDesktop.value = "";
    if (containers.sortSelect) containers.sortSelect.value = "default";

    window.UIModule.renderCategories(containers);
    renderResults();
  });

  // === PLANT MODAL ===
  containers.closeModal?.addEventListener("click", () =>
    window.UIModule.closePlantModal(containers.plantModal)
  );

  containers.plantModal?.addEventListener("click", (e) => {
    if (e.target === containers.plantModal)
      window.UIModule.closePlantModal(containers.plantModal);
  });

  // === CART DRAWER ===
  containers.cartBtn?.addEventListener("click", () => {
    window.UIModule.renderCartDrawer(containers);
    containers.cartDrawer?.classList.add("active");
    containers.cartDrawer?.setAttribute("aria-hidden", "false");
  });

  containers.closeCart?.addEventListener("click", () => {
    containers.cartDrawer?.classList.remove("active");
    containers.cartDrawer?.setAttribute("aria-hidden", "true");
  });

  containers.cartDrawer?.addEventListener("click", (e) => {
    if (e.target === containers.cartDrawer) {
      containers.cartDrawer?.classList.remove("active");
      containers.cartDrawer?.setAttribute("aria-hidden", "true");
    }
  });

  // === MENU DRAWER ===
  containers.menuBtn?.addEventListener("click", () => {
    containers.menuDrawer?.classList.add("active");
    containers.menuDrawer?.setAttribute("aria-hidden", "false");
  });

  containers.closeMenu?.addEventListener("click", () => {
    containers.menuDrawer?.classList.remove("active");
    containers.menuDrawer?.setAttribute("aria-hidden", "true");
  });

  containers.menuDrawer?.addEventListener("click", (e) => {
    if (e.target === containers.menuDrawer) {
      containers.menuDrawer?.classList.remove("active");
      containers.menuDrawer?.setAttribute("aria-hidden", "true");
    }
  });

  containers.menuGoHome?.addEventListener("click", () => {
    containers.menuDrawer?.classList.remove("active");
    containers.menuDrawer?.setAttribute("aria-hidden", "true");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  containers.menuGoCart?.addEventListener("click", () => {
    containers.menuDrawer?.classList.remove("active");
    containers.menuDrawer?.setAttribute("aria-hidden", "true");
    window.UIModule.renderCartDrawer(containers);
    containers.cartDrawer?.classList.add("active");
    containers.cartDrawer?.setAttribute("aria-hidden", "false");
  });

  containers.logoHome?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  containers.logoHome?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ")
      window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // === CONTACTS ===
  if (containers.viberLink && CONTACTS.viberNumber) {
    containers.viberLink.href = `viber://chat?number=${CONTACTS.viberNumber}`;
  }

  if (containers.telegramLink) {
    containers.telegramLink.href = `${CONTACTS.telegramShareUrl}?text=${encodeURIComponent(
      "Привіт! Хочу замовити рослину 🌿"
    )}`;
  }

  // === TABS (мобільні) ===
  if (containers.tabBtns) {
    containers.tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        containers.tabBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const tab = btn.dataset.tab;
        if (tab === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (tab === "categories") {
          document.querySelector(".categories")?.scrollIntoView({ behavior: "smooth" });
        } else if (tab === "cart") {
          window.UIModule.renderCartDrawer(containers);
          containers.cartDrawer?.classList.add("active");
          containers.cartDrawer?.setAttribute("aria-hidden", "false");
        } else if (tab === "menu") {
          containers.menuDrawer?.classList.add("active");
          containers.menuDrawer?.setAttribute("aria-hidden", "false");
        }
      });
    });
  }

  // === KEYBOARD SHORTCUTS ===
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    if (containers.plantModal?.classList.contains("active"))
      window.UIModule.closePlantModal(containers.plantModal);
    if (containers.orderModal?.classList.contains("active"))
      containers.orderModal?.classList.remove("active");
    if (containers.searchOverlay?.classList.contains("active"))
      containers.closeSearch?.click();
    if (containers.cartDrawer?.classList.contains("active"))
      containers.closeCart?.click();
    if (containers.menuDrawer?.classList.contains("active"))
      containers.closeMenu?.click();
  });

  // === ORDER MODAL ===
  containers.closeOrderModal?.addEventListener("click", () => {
    containers.orderModal?.classList.remove("active");
    containers.orderModal?.setAttribute("aria-hidden", "true");
  });

  containers.orderModal?.addEventListener("click", (e) => {
    if (e.target === containers.orderModal) {
      containers.orderModal?.classList.remove("active");
      containers.orderModal?.setAttribute("aria-hidden", "true");
    }
  });

  // === ORDER FORM SUBMISSION ===
  containers.orderForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = Utils.q("orderName")?.value || "";
    const phone = Utils.q("orderPhone")?.value || "";
    const city = Utils.q("orderCity")?.value || "";
    const delivery = Utils.q("orderDelivery")?.value || "nova_poshta";
    const address = Utils.q("orderAddress")?.value || "";
    const comment = Utils.q("orderComment")?.value || "";

    if (!name || !phone) {
      Utils.showNotification("Заповніть ім'я та телефон", "error");
      return;
    }

    const formValues = { name, phone, city, delivery, address, comment };

    // If Firestore is not available – fallback to Telegram share
    if (!Utils.hasFirebase()) {
      const message = window.CartModule.buildOrderMessageFromCart(formValues);
      window.OrdersModule.sendViaTelegramShare(message, CONTACTS);
      window.CartModule.clearCart();
      window.UIModule.renderCartDrawer(containers);
      window.UIModule.updateCartBadges(containers);
      containers.orderForm?.reset();
      containers.orderModal?.classList.remove("active");
      containers.cartDrawer?.classList.remove("active");
      return;
    }

    try {
      if (containers.submitOrderBtn) {
        containers.submitOrderBtn.disabled = true;
        containers.submitOrderBtn.style.opacity = "0.85";
      }

      const orderId = await window.OrdersModule.submitOrderToFirestore(formValues);

      Utils.showNotification("Замовлення надіслано ✅");
      if (containers.orderHint) {
        containers.orderHint.textContent = `Дякуємо! Номер замовлення: ${orderId
          .slice(0, 8)
          .toUpperCase()}`;
      }

      // Clear cart
      window.CartModule.clearCart();
      window.UIModule.renderCartDrawer(containers);
      window.UIModule.updateCartBadges(containers);
      containers.orderForm?.reset();

      // Close modals
      setTimeout(() => {
        containers.orderModal?.classList.remove("active");
        containers.orderModal?.setAttribute("aria-hidden", "true");
        containers.cartDrawer?.classList.remove("active");
      }, 600);
    } catch (err) {
      console.error(err);
      Utils.showNotification("Не вдалося надіслати замовлення. Спробуйте ще раз.", "error");
      const message = window.CartModule.buildOrderMessageFromCart(formValues);
      window.OrdersModule.sendViaTelegramShare(message, CONTACTS);
    } finally {
      if (containers.submitOrderBtn) {
        containers.submitOrderBtn.disabled = false;
        containers.submitOrderBtn.style.opacity = "1";
      }
    }
  });

  // Send via Telegram button
  containers.sendViaTelegramBtn?.addEventListener("click", () => {
    const formValues = {
      name: Utils.q("orderName")?.value || "",
      phone: Utils.q("orderPhone")?.value || "",
      city: Utils.q("orderCity")?.value || "",
      delivery: Utils.q("orderDelivery")?.value || "nova_poshta",
      address: Utils.q("orderAddress")?.value || "",
      comment: Utils.q("orderComment")?.value || "",
    };

    const message = window.CartModule.buildOrderMessageFromCart(formValues);
    window.OrdersModule.sendViaTelegramShare(message, CONTACTS);
  });
}

/**
 * Рендерити результати (категорії, рослини, кількість)
 */
function renderResults() {
  window.UIModule.renderCategories(containers);
  window.UIModule.renderPlants(containers);
  window.UIModule.updateResultsCount(containers);
}

/**
 * Обробник оновлення даних рослин
 */
function onPlantsUpdated() {
  renderResults();
}

/**
 * Синхронізація з адмін-вікном
 */
window.addEventListener("message", (event) => {
  if (event?.data?.type === "PLANTS_UPDATED") {
    if (Utils.hasFirebase()) {
      window.PlantsModule.loadPlantsFromFirebaseOnce(onPlantsUpdated);
    } else {
      window.PlantsModule.loadPlantsFromStorage(onPlantsUpdated);
    }
  }
});

/**
 * Ініціалізація додатку
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeDOMElements();
  setupEventListeners();

  // Load cart from storage
  window.CartModule.loadCartFromStorage();
  window.UIModule.updateCartBadges(containers);

  // Load plants
  const subscribed = window.PlantsModule.subscribePlantsFromFirebase(onPlantsUpdated);
  if (!subscribed) {
    if (Utils.hasFirebase()) {
      window.PlantsModule.loadPlantsFromFirebaseOnce(onPlantsUpdated);
    } else {
      window.PlantsModule.loadPlantsFromStorage(onPlantsUpdated);
    }
  }
});

// Window message for broadcast from admin
window.broadcastPlantsUpdated = () => {
  onPlantsUpdated();
};
