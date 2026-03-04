/**
 * Admin Panel Main Module (v1.5.1)
 * Навігація + Auth gate + Orders wiring.
 * Логіка рослин в AdminPlantsModule (admin-modules/plants.js)
 */

;(() => {
  "use strict";

  const navBtns = document.querySelectorAll(".nav-btn");
  const adminSections = document.querySelectorAll(".admin-section");
  const orderStatusFilter = document.getElementById("orderStatusFilter");
  const orderSearch = document.getElementById("orderSearch");
  const refreshOrdersBtn = document.getElementById("refreshOrdersBtn");

  function showSection(sectionKey) {
    const targetId = sectionKey.endsWith("-section") ? sectionKey : `${sectionKey}-section`;

    adminSections.forEach((s) => {
      s.style.display = s.id === targetId ? "block" : "none";
    });

    navBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.section === sectionKey);
    });

    // актуалізація даних при переході
    if (sectionKey === "orders") window.AdminOrdersModule?.renderOrders?.();
    if (sectionKey === "list") window.AdminPlantsModule?.renderPlantsList?.();
  }

  // щоб інші модулі могли викликати перемикання
  window.AdminUI = { showSection };

  function init() {
    // Auth
    if (window.AdminAuthModule?.hasAuth?.()) {
      window.AdminAuthModule?.setupAuthEventListeners?.();
      window.AdminAuthModule?.initAuthListener?.();

      window.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          window.AdminOrdersModule?.unsubscribeFromOrders?.();
          window.AdminAuthModule?.showAuthGate?.("");
          return;
        }

        // Admin check
        try {
          const adminSnap = await window.db.collection("admins").doc(user.uid).get();
          const isEnabled = adminSnap.exists && adminSnap.data()?.enabled === true;

          if (!isEnabled) {
            await window.auth.signOut();
            window.AdminAuthModule?.showAuthGate?.(
              "Нема доступу. Додайте ваш UID в Firestore: колекція 'admins' → документ з id = UID → поле enabled=true."
            );
            return;
          }
        } catch (e) {
          console.error(e);
          await window.auth.signOut();
          window.AdminAuthModule?.showAuthGate?.(
            "Нема доступу або не налаштовані правила Firestore для 'admins'."
          );
          return;
        }

        window.AdminAuthModule?.showAdminApp?.(user);

        // завантаження даних
        window.AdminPlantsModule?.loadPlants?.();
        window.AdminOrdersModule?.subscribeToOrders?.();

        // після логіна завжди показуємо форму (щоб не було “білих екранів”)
        showSection("add");
      });

      window.AdminAuthModule?.showAuthGate?.("");
    } else {
      window.AdminAuthModule?.showAuthGate?.(
        "Firebase Auth не налаштований. Потрібно підключити Firebase та увімкнути Email/Password sign-in."
      );
    }

    // Навігація
    navBtns.forEach((btn) => {
      btn.addEventListener("click", () => showSection(btn.dataset.section));
    });

    // Orders filters
    orderStatusFilter?.addEventListener("change", () => window.AdminOrdersModule?.renderOrders?.());
    orderSearch?.addEventListener("input", () => window.AdminOrdersModule?.renderOrders?.());
    refreshOrdersBtn?.addEventListener("click", () => window.AdminOrdersModule?.loadOrdersOnce?.());

    // Глобальні inline-функції з admin.html
    window.editPlant = (id) => window.AdminPlantsModule?.editPlant?.(id);
    window.deletePlant = (id) => window.AdminPlantsModule?.deletePlant?.(id);
    window.exportData = () => window.AdminPlantsModule?.exportData?.();

    // стартовий стан до логіну
    showSection("add");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();