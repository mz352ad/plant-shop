/**
 * Admin Plants Module (v1.5.1)
 * Повна логіка адмінки рослин: submit, list, edit, delete, import/export, image upload.
 */

;(() => {
  "use strict";

  let plantsData = [];
  let editingPlantId = null;

  const FIXED_VIBER = "+380966970439";
  const FIXED_TELEGRAM = "+380966970439";

  // DOM
  const addPlantForm = document.getElementById("addPlantForm");
  const plantsList = document.getElementById("plantsList");
  const messageContainer = document.getElementById("message-container");
  const imageFile = document.getElementById("imageFile");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  const removeImage = document.getElementById("removeImage");
  const importFile = document.getElementById("importFile");
  const uploadContainer = document.getElementById("uploadContainer");

  function hasFirebase() {
    return !!(window.db && window.auth);
  }

  function safeText(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function showMessage(message, type = "success") {
    if (!messageContainer) return;
    messageContainer.innerHTML = `
      <div class="message ${type}">
        <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i>
        ${safeText(message)}
      </div>
    `;
    setTimeout(() => (messageContainer.innerHTML = ""), 5000);
  }

  function generateId() {
    return `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  async function loadPlantsFromFirebase() {
    const snapshot = await window.db.collection("plants").get();
    plantsData = [];
    snapshot.forEach((doc) => plantsData.push({ id: doc.id, ...doc.data() }));
    renderPlantsList();
  }

  function loadPlantsFromStorage() {
    const saved = localStorage.getItem("plantsData");
    plantsData = saved ? JSON.parse(saved) : [];
    renderPlantsList();
  }

  async function loadPlants() {
    try {
      if (hasFirebase()) return await loadPlantsFromFirebase();
      loadPlantsFromStorage();
    } catch (e) {
      console.error(e);
      showMessage("Помилка завантаження рослин. Перемикаюсь на localStorage.", "error");
      loadPlantsFromStorage();
    }
  }

  async function savePlantToFirebase(plant) {
    if (!hasFirebase()) return false;

    if (plant.id) {
      const id = plant.id;
      const copy = { ...plant };
      delete copy.id;
      await window.db.collection("plants").doc(id).set(copy, { merge: true });
      return true;
    } else {
      const copy = { ...plant };
      delete copy.id;
      const docRef = await window.db.collection("plants").add(copy);
      plant.id = docRef.id;
      return true;
    }
  }

  function savePlantToStorage(plant) {
    if (plant.id) plantsData = plantsData.map((p) => (p.id === plant.id ? { ...p, ...plant } : p));
    else {
      plant.id = generateId();
      plantsData.unshift(plant);
    }
    localStorage.setItem("plantsData", JSON.stringify(plantsData));
    renderPlantsList();
    return true;
  }

  async function savePlant(plant) {
    try {
      if (hasFirebase()) {
        const ok = await savePlantToFirebase(plant);
        if (ok) await loadPlantsFromFirebase();
        return ok;
      }
      return savePlantToStorage(plant);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function deletePlant(plantId) {
    if (!confirm("Ви впевнені, що хочете видалити цю рослину?")) return;

    try {
      if (hasFirebase()) {
        await window.db.collection("plants").doc(plantId).delete();
        await loadPlantsFromFirebase();
      } else {
        plantsData = plantsData.filter((p) => p.id !== plantId);
        localStorage.setItem("plantsData", JSON.stringify(plantsData));
        renderPlantsList();
      }
      showMessage("Рослину успішно видалено!");
      if (window.opener) window.opener.postMessage({ type: "PLANTS_UPDATED" }, "*");
    } catch (e) {
      console.error(e);
      showMessage("Помилка при видаленні рослини", "error");
    }
  }

  function renderPlantsList() {
    if (!plantsList) return;

    if (!plantsData.length) {
      plantsList.innerHTML = `
        <div class="no-results">
          <h3>Рослини ще не додані</h3>
          <p>Додайте першу рослину через форму</p>
        </div>
      `;
      return;
    }

    plantsList.innerHTML = "";
    plantsData.forEach((plant) => {
      const item = document.createElement("div");
      item.className = "plant-item";

      const isImageData = plant.image && String(plant.image).startsWith("data:image");

      item.innerHTML = `
        <div class="plant-header">
          <h3 class="plant-name">${safeText(plant.name)}</h3>
          <div class="plant-actions">
            <button class="btn btn-secondary" data-action="edit" data-id="${safeText(plant.id)}">
              <i class="fas fa-edit"></i> Редагувати
            </button>
            <button class="btn btn-danger" data-action="delete" data-id="${safeText(plant.id)}">
              <i class="fas fa-trash"></i> Видалити
            </button>
          </div>
        </div>

        <div class="plant-info">
          <div class="info-item"><span class="info-label">Категорія</span><span class="info-value">${safeText(plant.category || "—")}</span></div>
          <div class="info-item"><span class="info-label">Ціна</span><span class="info-value">${safeText(plant.price)} грн</span></div>
          <div class="info-item">
            <span class="info-label">Зображення</span>
            <span class="info-value">
              ${
                plant.image
                  ? isImageData
                    ? `<img src="${plant.image}" alt="img" style="max-width:110px;max-height:110px;border-radius:10px;object-fit:cover;">`
                    : safeText(plant.image)
                  : "—"
              }
            </span>
          </div>
        </div>

        ${plant.description ? `<div class="info-item"><span class="info-label">Опис</span><span class="info-value">${safeText(plant.description)}</span></div>` : ""}
      `;

      plantsList.appendChild(item);
    });
  }

  function editPlant(plantId) {
    const plant = plantsData.find((p) => p.id === plantId);
    if (!plant) return showMessage("Рослину не знайдено", "error");

    editingPlantId = plantId;

    document.getElementById("plantName").value = plant.name || "";
    document.getElementById("plantCategory").value = plant.category || "";
    document.getElementById("plantPrice").value = plant.price ?? "";
    document.getElementById("plantPromoPrice").value = plant.promoPrice ?? "";
    document.getElementById("plantPromoEndDate").value = plant.promoEndDate || "";
    document.getElementById("plantDescription").value = plant.description || "";
    document.getElementById("plantImage").value = plant.image || "";

    if (plant.image && previewImg && imagePreview) {
      previewImg.src = plant.image;
      imagePreview.style.display = "block";
    }

    const submitBtn = addPlantForm?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Оновити рослину';

    addPlantForm?.scrollIntoView({ behavior: "smooth" });
  }

  function exportData() {
    const dataStr = JSON.stringify(plantsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `plants-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    showMessage("Дані експортовано успішно!");
  }

  function removeImagePreview() {
    document.getElementById("plantImage").value = "";
    if (imagePreview) imagePreview.style.display = "none";
    if (imageFile) imageFile.value = "";
    showMessage("Фото видалено", "success");
  }

  async function handlePlantFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(addPlantForm);
    const plant = {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      price: parseInt(formData.get("price"), 10),
      promoPrice: formData.get("promoPrice") ? parseInt(formData.get("promoPrice"), 10) : null,
      promoEndDate: formData.get("promoEndDate") || null,
      image: formData.get("image") || "",
      description: String(formData.get("description") || "").trim(),
      viber: FIXED_VIBER,
      telegram: FIXED_TELEGRAM,
    };

    if (!plant.category) return showMessage("Категорія обов'язкова", "error");
    if (Number.isNaN(plant.price)) return showMessage("Ціна має бути числом", "error");

    if (editingPlantId) plant.id = editingPlantId;

    const ok = await savePlant(plant);
    if (!ok) return showMessage("Помилка при збереженні рослини", "error");

    showMessage(editingPlantId ? "Рослину успішно оновлено!" : "Рослину успішно додано!");
    addPlantForm.reset();
    editingPlantId = null;

    const submitBtn = addPlantForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Додати рослину';

    if (imagePreview) imagePreview.style.display = "none";

    // після додавання — одразу показати список
    window.AdminUI?.showSection?.("list");
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Неправильний формат файлу");

      let success = 0;
      for (const p of imported) {
        const copy = { ...p };
        delete copy.id;
        const ok = await savePlant(copy);
        if (ok) success++;
      }

      showMessage(`Імпортовано ${success} рослин`);
      if (importFile) importFile.value = "";
      window.AdminUI?.showSection?.("list");
    } catch (err) {
      console.error(err);
      showMessage("Помилка при імпорті файлу", "error");
      if (importFile) importFile.value = "";
    }
  }

  function handlePlantsListClick(e) {
    const btn = e.target.closest?.("button[data-action][data-id]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");

    if (action === "edit") editPlant(id);
    if (action === "delete") deletePlant(id);
  }

  function initUI() {
    addPlantForm?.addEventListener("submit", handlePlantFormSubmit);
    removeImage?.addEventListener("click", removeImagePreview);
    importFile?.addEventListener("change", handleImport);
    plantsList?.addEventListener("click", handlePlantsListClick);

    // drag & drop click-to-upload
    if (uploadContainer) {
      uploadContainer.addEventListener("click", () => imageFile?.click());
    }
  }

  window.AdminPlantsModule = {
    loadPlants,
    savePlant,
    deletePlant,
    renderPlantsList,
    editPlant,
    exportData,
    showMessage,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initUI);
  else initUI();
})();