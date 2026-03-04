/**
 * UI Module
 * Рендеринг компонентів каталогу, деталей рослин, кошика тощо
 */

/**
 * Рендерити категорії
 * @param {object} containers - DOM елементи {categoriesContainer}
 */
function renderCategories(containers) {
  const { categoriesContainer } = containers;
  if (!categoriesContainer) return;

  const counts = window.PlantsModule.getCategoryCounts();
  const plantCount = window.getPlantsData().length;
  const unique = Object.keys(counts).sort((a, b) => a.localeCompare(b, "uk"));
  const cats = ["all", ...unique];

  categoriesContainer.innerHTML = "";

  cats.forEach((cat) => {
    const meta = Utils.getCategoryMeta(cat);
    const btn = document.createElement("button");
    btn.className = "category-btn";
    if (window.SearchModule.getFilterState().category === cat) {
      btn.classList.add("active");
    }
    btn.dataset.category = cat;
    btn.type = "button";
    btn.innerHTML = `
      <i class="fas ${meta.icon}"></i>
      <span>${Utils.safeText(meta.label)}</span>
      <span class="category-count">${cat === "all" ? plantCount : counts[cat] || 0}</span>
    `;

    btn.addEventListener("click", () => {
      window.SearchModule.setCategory(cat);
      // Оновити активну кнопку
      document.querySelectorAll(".category-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Оновити результати
      renderPlants(containers);
      updateResultsCount(containers);
    });

    categoriesContainer.appendChild(btn);
  });
}

/**
 * Рендерити список рослин
 * @param {object} containers - DOM елементи
 */
function renderPlants(containers) {
  const { plantsGrid } = containers;
  if (!plantsGrid) return;

  const items = window.SearchModule.getFilteredResults();
  plantsGrid.innerHTML = "";

  if (items.length === 0) {
    const plantCount = window.getPlantsData().length;
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.innerHTML = `
      <i class="fas ${plantCount ? "fa-search" : "fa-seedling"}" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
      <h3>${plantCount ? "Нічого не знайдено" : "Каталог порожній"}</h3>
      <p>${
        plantCount
          ? "Спробуйте змінити фільтри або пошуковий запит."
          : "Додайте перші позиції через адмін-панель (⚙️) або імпорт JSON."
      }</p>
    `;
    plantsGrid.appendChild(empty);
    return;
  }

  items.forEach((plant) => {
    const card = createPlantCard(plant, containers);
    plantsGrid.appendChild(card);
  });
}

/**
 * Створити карточку рослини
 * @param {object} plant - Дані рослини
 * @param {object} containers - DOM контейнери для callback'ів
 * @returns {HTMLElement}
 */
function createPlantCard(plant, containers) {
  const card = document.createElement("div");
  card.className = "plant-card";
  card.dataset.id = plant.id;

  const isImage = Utils.isImageDataUrl(plant.image);
  const catMeta = Utils.getCategoryMeta(plant.category || "other");
  const discount = Utils.calcDiscountPercent(plant);

  const priceHtml = plant.promoPrice
    ? `<span style="text-decoration: line-through; color: #999; font-size: 0.95em;">${Utils.formatUAH(plant.price)}</span><br>
       <span style="color: #e91e63; font-weight: 800;">${Utils.formatUAH(plant.promoPrice)}</span>`
    : `<span style="font-weight: 800; color: #2e7d32;">${Utils.formatUAH(plant.price)}</span>`;

  card.innerHTML = `
    <div class="plant-image">
      ${discount ? `<div class="plant-badge">-${discount}%</div>` : ""}
      ${
        isImage
          ? `<img src="${plant.image}" alt="${Utils.safeText(plant.name)}" class="plant-img">`
          : `<span class="plant-emoji">${Utils.safeText(plant.image || "🌿")}</span>`
      }
    </div>
    <div class="plant-info">
      <h3 class="plant-name">${Utils.safeText(plant.name)}</h3>
      <p class="plant-category">${Utils.safeText(catMeta.label)}</p>
      <p class="plant-price">${priceHtml}</p>

      <div class="plant-card-footer">
        <button class="details-small" type="button">Деталі</button>
        <button class="add-small" type="button"><i class="fas fa-cart-plus"></i> У кошик</button>
      </div>
    </div>
  `;

  // Card click -> details
  card.addEventListener("click", () => showPlantDetails(plant, containers));

  // Buttons
  const detailsBtn = card.querySelector(".details-small");
  const addBtn = card.querySelector(".add-small");

  detailsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPlantDetails(plant, containers);
  });

  addBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.CartModule.addToCart(plant.id, plant);
    updateCartBadges(containers);
  });

  return card;
}

/**
 * Показати деталі рослини в модальному вікні
 * @param {object} plant - Дані рослини
 * @param {object} containers - DOM елементи
 */
function showPlantDetails(plant, containers) {
  const { plantModal, plantDetails } = containers;
  if (!plantModal || !plantDetails) return;

  const catMeta = Utils.getCategoryMeta(plant.category || "other");
  const isImage = Utils.isImageDataUrl(plant.image);
  const discount = Utils.calcDiscountPercent(plant);
  const article = plant.id ? String(plant.id).substring(0, 6).toUpperCase() : "000000";

  const priceBlock = plant.promoPrice
    ? `
      <div class="pricing-section">
        <div class="price-promo">
          <span class="price-main">${Utils.formatUAH(plant.promoPrice)}</span>
          <span class="price-period">акційна ціна</span>
        </div>
        <div class="price-regular">
          <span class="price-old">${Utils.formatUAH(plant.price)}</span>
          <span class="price-period">${
            plant.promoEndDate
              ? `до ${new Date(plant.promoEndDate).toLocaleDateString("uk-UA")}`
              : "звичайна ціна"
          }</span>
        </div>
      </div>
    `
    : `
      <div class="pricing-section">
        <div class="price-promo">
          <span class="price-main">${Utils.formatUAH(plant.price)}</span>
          <span class="price-period">звичайна ціна</span>
        </div>
      </div>
    `;

  plantDetails.innerHTML = `
    <div class="plant-detail-image">
      ${discount ? `<div class="plant-badge" style="top:16px;left:16px;">-${discount}%</div>` : ""}
      ${
        isImage
          ? `<img src="${plant.image}" alt="${Utils.safeText(plant.name)}" class="plant-detail-img">`
          : `<span class="plant-emoji-large">${Utils.safeText(plant.image || "🌿")}</span>`
      }
    </div>

    <div class="plant-detail-info">
      <div class="product-header">
        <div class="availability">
          <i class="fas fa-check-circle"></i>
          <span>В наявності</span>
        </div>
        <div class="article-number">Артикул: ${Utils.safeText(article)}</div>
      </div>

      <h2 class="plant-detail-name">${Utils.safeText(plant.name)}</h2>
      <p class="plant-category">${Utils.safeText(catMeta.label)}</p>

      ${priceBlock}

      <div class="contact-icons" style="margin-bottom: 14px;">
        <button class="add-to-cart-btn" id="detailsAddToCart" type="button">
          <i class="fas fa-shopping-cart"></i> Додати в кошик
        </button>
        <button class="btn-ghost" id="detailsQuickOrder" type="button" style="width:100%; margin-top:10px;">
          <i class="fas fa-paper-plane"></i> Швидке замовлення
        </button>
      </div>

      <div class="product-description">
        <h4>Опис:</h4>
        <p>${Utils.safeText(plant.description || "Опис буде додано найближчим часом.")}</p>
      </div>
    </div>
  `;

  Utils.q("detailsAddToCart")?.addEventListener("click", () => {
    window.CartModule.addToCart(plant.id, plant);
    updateCartBadges(containers);
  });

  Utils.q("detailsQuickOrder")?.addEventListener("click", () => {
    window.CartModule.addToCart(plant.id, plant);
    updateCartBadges(containers);
    containers.cartDrawer?.classList.add("active");
    containers.cartDrawer?.setAttribute("aria-hidden", "false");
    Utils.showNotification("Додано у кошик", "success");
  });

  plantModal.classList.add("active");
  plantModal.setAttribute("aria-hidden", "false");
}

/**
 * Закрити модальне вікно деталей рослини
 * @param {HTMLElement} plantModal - Модальне вікно
 */
function closePlantModal(plantModal) {
  if (!plantModal) return;
  plantModal.classList.remove("active");
  plantModal.setAttribute("aria-hidden", "true");
}

/**
 * Оновити лічильник кошика
 * @param {object} containers - DOM елементи
 */
function updateCartBadges(containers) {
  const { cartCountHeader, cartCountMobile } = containers;
  const totalItems = window.CartModule.getCartItemsCount();

  if (cartCountHeader) cartCountHeader.textContent = totalItems;
  if (cartCountMobile) cartCountMobile.textContent = totalItems;
}

/**
 * Рендерити вміст кошика в drawer'і
 * @param {object} containers - DOM елементи
 */
function renderCartDrawer(containers) {
  const { cartItems, cartSummary } = containers;
  if (!cartItems || !cartSummary) return;

  const cart = window.CartModule.getCart();

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="no-results" style="box-shadow:none; border:none; padding: 30px 12px;">
        <i class="fas fa-shopping-cart" style="font-size: 2.5rem; color: #ccc; margin-bottom: 12px;"></i>
        <h3>Кошик порожній</h3>
        <p>Додайте рослини у кошик — і оформіть замовлення.</p>
      </div>
    `;
    cartSummary.innerHTML = "";
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const isImage = Utils.isImageDataUrl(item.image);

    row.innerHTML = `
      <div class="cart-item-image">
        ${
          isImage
            ? `<img src="${item.image}" alt="${Utils.safeText(item.name)}" class="cart-item-img">`
            : `<span class="plant-emoji">${Utils.safeText(item.image || "🌿")}</span>`
        }
      </div>

      <div class="cart-item-info">
        <h3>${Utils.safeText(item.name)}</h3>
        <p>${Utils.formatUAH(item.price)}</p>
      </div>

      <div class="cart-item-quantity">
        <button type="button" aria-label="Зменшити">-</button>
        <span>${item.quantity}</span>
        <button type="button" aria-label="Збільшити">+</button>
      </div>

      <div class="cart-item-total">${Utils.formatUAH(item.price * item.quantity)}</div>

      <button class="remove-item" type="button" aria-label="Видалити">
        <i class="fas fa-trash"></i>
      </button>
    `;

    const btns = row.querySelectorAll(".cart-item-quantity button");
    btns[0].addEventListener("click", () => {
      window.CartModule.updateQuantity(item.id, -1);
      renderCartDrawer(containers);
      updateCartBadges(containers);
    });
    btns[1].addEventListener("click", () => {
      window.CartModule.updateQuantity(item.id, 1);
      renderCartDrawer(containers);
      updateCartBadges(containers);
    });

    row.querySelector(".remove-item").addEventListener("click", () => {
      window.CartModule.removeFromCart(item.id);
      renderCartDrawer(containers);
      updateCartBadges(containers);
    });

    cartItems.appendChild(row);
  });

  const total = window.CartModule.getCartTotal();

  cartSummary.innerHTML = `
    <div class="cart-total" style="box-shadow:none; border: 2px solid #e8f5e8;">
      <h3>Разом: ${Utils.formatUAH(total)}</h3>
      <button class="checkout-btn" id="checkoutBtn" type="button">
        <i class="fas fa-paper-plane"></i> Оформити замовлення
      </button>
      <button class="btn-ghost" id="clearCartBtn" type="button" style="width:100%; margin-top:10px;">
        <i class="fas fa-trash"></i> Очистити кошик
      </button>
    </div>
  `;

  Utils.q("checkoutBtn")?.addEventListener("click", () => {
    containers.orderModal?.classList.add("active");
    containers.orderModal?.setAttribute("aria-hidden", "false");
  });

  Utils.q("clearCartBtn")?.addEventListener("click", () => {
    window.CartModule.clearCart();
    renderCartDrawer(containers);
    updateCartBadges(containers);
    Utils.showNotification("Кошик очищено");
  });
}

/**
 * Оновити кількість результатів
 * @param {object} containers - DOM елементи
 */
function updateResultsCount(containers) {
  const { resultsCount } = containers;
  if (!resultsCount) return;

  const count = window.SearchModule.getResultsCount();
  resultsCount.textContent = `${count} товар(ів)`;
}

// Export модуля
window.UIModule = {
  renderCategories,
  renderPlants,
  createPlantCard,
  showPlantDetails,
  closePlantModal,
  updateCartBadges,
  renderCartDrawer,
  updateResultsCount
};
