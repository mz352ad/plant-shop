/**
 * Plants Admin Module (v1.5.2)
 * CRUD + UI (form submit, image upload, import/export, edit/delete)
 */

;(() => {
  "use strict";

  let plantsData = [];
  let editingPlantId = null;

  // Fixed contacts (як було раніше в admin-main)
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
  const plantImageInput = document.getElementById("plantImage"); // hidden input

  /**
   * Перевірити наявність Firebase
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
   * Безпечно екранізувати текст для HTML (і для атрибутів теж)
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
   * Показати повідомлення
   * @param {string} message
   * @param {'success'|'error'} type
   */
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

  /**
   * Отримати мітку категорії
   * @param {string} category
   * @returns {string}
   */
  function getCategoryLabel(category) {
    const map = {
      indoor: "Кімнатні",
      garden: "Садові",
      exotic: "Екзотичні",
    };
    return map[category] || (category ? category[0].toUpperCase() + category.slice(1) : "—");
  }

  /**
   * Генерувати локальний ID
   * @returns {string}
   */
  function generateId() {
    return `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  /**
   * Завантажити рослини з localStorage
   */
  function loadPlantsFromStorage() {
    const saved = localStorage.getItem("plantsData");
    plantsData = saved ? JSON.parse(saved) : [];
    renderPlantsList();
  }

  /**
   * Зберегти рослини у localStorage
   */
  function savePlantsToStorage() {
    localStorage.setItem("plantsData", JSON.stringify(plantsData));
  }

  /**
   * Завантажити рослини з Firebase
   */
  async function loadPlantsFromFirebase() {
    try {
      const snapshot = await window.db.collection("plants").get();
      plantsData = [];
      snapshot.forEach((doc) => plantsData.push({ id: doc.id, ...doc.data() }));
      renderPlantsList();
    } catch (error) {
      console.error("Помилка завантаження рослин:", error);
      showMessage("Помилка завантаження рослин. Перемикаюсь на localStorage.", "error");
      loadPlantsFromStorage();
    }
  }

  /**
   * Зберегти рослину у Firebase
   * @param {Object} plant
   * @returns {Promise<boolean>}
   */
  async function savePlantToFirebase(plant) {
    try {
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
    } catch (error) {
      console.error("Помилка збереження рослини:", error);
      return false;
    }
  }

  /**
   * Видалити рослину з Firebase
   * @param {string} plantId
   * @returns {Promise<boolean>}
   */
  async function deletePlantFromFirebase(plantId) {
    try {
      await window.db.collection("plants").doc(plantId).delete();
      return true;
    } catch (error) {
      console.error("Помилка видалення рослини:", error);
      return false;
    }
  }

  /**
   * Завантажити рослини (Firebase або localStorage)
   */
  async function loadPlants() {
    if (hasFirebase()) return loadPlantsFromFirebase();
    return loadPlantsFromStorage();
  }

  /**
   * Зберегти рослину (Firebase або localStorage)
   * @param {Object} plant
   * @returns {Promise<boolean>}
   */
  async function savePlant(plant) {
    if (hasFirebase()) {
      const ok = await savePlantToFirebase(plant);
      if (ok) await loadPlantsFromFirebase();
      return ok;
    }

    // local
    if (plant.id) {
      plantsData = plantsData.map((p) => (p.id === plant.id ? { ...p, ...plant } : p));
    } else {
      plant.id = generateId();
      plantsData.unshift(plant);
    }
    savePlantsToStorage();
    renderPlantsList();
    return true;
  }

  /**
   * Видалити рослину
   * @param {string} plantId
   */
  async function deletePlant(plantId) {
    if (!confirm("Ви впевнені, що хочете видалити цю рослину?")) return;

    if (hasFirebase()) {
      const ok = await deletePlantFromFirebase(plantId);
      if (ok) {
        await loadPlantsFromFirebase();
        showMessage("Рослину успішно видалено!");
        if (window.opener) window.opener.postMessage({ type: "PLANTS_UPDATED" }, "*");
      } else {
        showMessage("Помилка при видаленні рослини", "error");
      }
      return;
    }

    plantsData = plantsData.filter((p) => p.id !== plantId);
    savePlantsToStorage();
    renderPlantsList();
    showMessage("Рослину успішно видалено!");
    if (window.opener) window.opener.postMessage({ type: "PLANTS_UPDATED" }, "*");
  }

  /**
   * Отримати дані
   * @returns {Object[]}
   */
  function getPlantsData() {
    return plantsData;
  }

  /**
   * Встановити рослину для редагування
   * @param {string|null} id
   */
  function setEditingPlantId(id) {
    editingPlantId = id;
  }

  /**
   * Отримати ID рослини, що редагується
   * @returns {string|null}
   */
  function getEditingPlantId() {
    return editingPlantId;
  }

  /**
   * Рендерити список рослин
   */
  function renderPlantsList() {
    if (!plantsList) return;

    if (!plantsData.length) {
      plantsList.innerHTML = `
        <div class="no-results">
          <i class="fas fa-seedling" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
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
          <div class="info-item">
            <span class="info-label">Категорія</span>
            <span class="info-value">${safeText(getCategoryLabel(plant.category))}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Ціна</span>
            <span class="info-value">
              ${
                plant.promoPrice
                  ? `<span style="text-decoration: line-through; color: #999;">${safeText(plant.price)} грн</span><br>
                     <span style="color: #e91e63; font-weight: bold;">${safeText(plant.promoPrice)} грн</span>
                     ${
                       plant.promoEndDate
                         ? `<br><small>до ${new Date(plant.promoEndDate).toLocaleDateString("uk-UA")}</small>`
                         : ""
                     }`
                  : `${safeText(plant.price)} грн`
              }
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">Зображення</span>
            <span class="info-value">
              ${
                plant.image
                  ? isImageData
                    ? `<img src="${plant.image}" alt="Зображення" style="max-width: 110px; max-height: 110px; border-radius: 10px; object-fit: cover; border: 2px solid #e8f5e8;">`
                    : safeText(plant.image)
                  : "🌿"
              }
            </span>
          </div>
        </div>

        ${
          plant.description
            ? `
              <div class="info-item">
                <span class="info-label">Опис</span>
                <span class="info-value">${safeText(plant.description)}</span>
              </div>
            `
            : ""
        }
      `;

      plantsList.appendChild(item);
    });
  }

  /**
   * Редагувати рослину (заповнює форму)
   * @param {string} plantId
   */
  function editPlant(plantId) {
    const plant = plantsData.find((p) => p.id === plantId);

    if (!plant) {
      showMessage("Рослину не знайдено", "error");
      return;
    }

    setEditingPlantId(plantId);

    document.getElementById("plantName").value = plant.name || "";
    document.getElementById("plantCategory").value = plant.category || "";
    document.getElementById("plantPrice").value = plant.price ?? "";
    document.getElementById("plantPromoPrice").value = plant.promoPrice ?? "";
    document.getElementById("plantPromoEndDate").value = plant.promoEndDate || "";
    document.getElementById("plantDescription").value = plant.description || "";

    if (plantImageInput) plantImageInput.value = plant.image || "";

    if (plant.image && previewImg && imagePreview) {
      previewImg.src = plant.image;
      imagePreview.style.display = "block";
    }

    const submitBtn = addPlantForm?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Оновити рослину';

    addPlantForm?.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Експортувати рослини
   */
  function exportData() {
    const dataStr = JSON.stringify(plantsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `plants-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();

    showMessage("Дані експортовано успішно!");
  }

  function estimateDataUrlBytes(dataUrl) {
    const comma = dataUrl.indexOf(",");
    const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    return Math.floor((b64.length * 3) / 4);
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  async function compressImageToDataURL(file, maxBytes) {
    const img = await loadImageFromFile(file);
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    let w = Math.max(1, Math.round(img.width * scale));
    let h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    let quality = 0.85;
    let dataUrl = "";

    for (let attempt = 0; attempt < 8; attempt++) {
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      dataUrl = canvas.toDataURL("image/jpeg", quality);
      const bytes = estimateDataUrlBytes(dataUrl);
      if (bytes <= maxBytes) return dataUrl;

      if (quality > 0.45) quality -= 0.08;
      else {
        w = Math.max(320, Math.round(w * 0.85));
        h = Math.max(320, Math.round(h * 0.85));
      }
    }

    return dataUrl;
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 500 * 1024; // 500KB
    try {
      const imageData = await compressImageToDataURL(file, maxSize);

      if (plantImageInput) plantImageInput.value = imageData;

      if (previewImg && imagePreview) {
        previewImg.src = imageData;
        imagePreview.style.display = "block";
      }

      showMessage("Фото успішно завантажено!", "success");
    } catch (e) {
      console.error(e);
      showMessage("Не вдалося обробити фото. Спробуйте інше зображення.", "error");
    }
  }

  function removeImagePreview() {
    if (plantImageInput) plantImageInput.value = "";
    if (imagePreview) imagePreview.style.display = "none";
    if (imageFile) imageFile.value = "";
    showMessage("Фото видалено", "success");
  }

  async function handlePlantFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!addPlantForm) return;

    const formData = new FormData(addPlantForm);

    const price = parseInt(formData.get("price"), 10);
    if (Number.isNaN(price)) {
      showMessage("Ціна має бути числом", "error");
      return;
    }

    const promoRaw = formData.get("promoPrice");
    const promoPrice = promoRaw ? parseInt(promoRaw, 10) : null;
    if (promoRaw && Number.isNaN(promoPrice)) {
      showMessage("Акційна ціна має бути числом", "error");
      return;
    }

    const plant = {
      name: String(formData.get("name") || "").trim(),
      category: String(formData.get("category") || "").trim(),
      price,
      promoPrice,
      promoEndDate: formData.get("promoEndDate") || null,
      image: (plantImageInput?.value || ""), // ВАЖЛИВО: беремо з hidden input
      description: String(formData.get("description") || "").trim(),
      viber: FIXED_VIBER,
      telegram: FIXED_TELEGRAM,
    };

    if (!plant.category) {
      showMessage("Категорія обов'язкова", "error");
      return;
    }

    const editingId = getEditingPlantId();
    if (editingId) plant.id = editingId;

    const ok = await savePlant(plant);
    if (!ok) {
      showMessage("Помилка при збереженні рослини", "error");
      return;
    }

    showMessage(editingId ? "Рослину успішно оновлено!" : "Рослину успішно додано!");
    addPlantForm.reset();
    setEditingPlantId(null);

    // гарантовано почистити hidden image
    if (plantImageInput) plantImageInput.value = "";

    const submitBtn = addPlantForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Додати рослину';

    if (imagePreview) imagePreview.style.display = "none";

    if (window.opener) window.opener.postMessage({ type: "PLANTS_UPDATED" }, "*");
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Неправильний формат файлу");

      let successCount = 0;
      for (const plant of imported) {
        const copy = { ...plant };
        delete copy.id;
        const ok = await savePlant(copy);
        if (ok) successCount++;
      }

      showMessage(`Імпортовано ${successCount} рослин`);
      if (importFile) importFile.value = "";

      if (window.opener) window.opener.postMessage({ type: "PLANTS_UPDATED" }, "*");
    } catch (error) {
      console.error("Помилка імпорту:", error);
      showMessage("Помилка при імпорті файлу", "error");
      if (importFile) importFile.value = "";
    }
  }

  function handlePlantsListClick(e) {
    const btn = e.target.closest?.("button[data-action][data-id]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id") || "";
    if (!id) return;

    if (action === "edit") editPlant(id);
    if (action === "delete") deletePlant(id);
  }

  function initUI() {
    addPlantForm?.addEventListener("submit", handlePlantFormSubmit);
    imageFile?.addEventListener("change", handleImageUpload);
    removeImage?.addEventListener("click", removeImagePreview);
    importFile?.addEventListener("change", handleImport);
    plantsList?.addEventListener("click", handlePlantsListClick);

    if (uploadContainer) {
      uploadContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadContainer.classList.add("dragover");
      });
      uploadContainer.addEventListener("dragleave", (e) => {
        e.preventDefault();
        uploadContainer.classList.remove("dragover");
      });
      uploadContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadContainer.classList.remove("dragover");

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const f = files[0];
          if (f.type.startsWith("image/")) {
            imageFile.files = files;
            handleImageUpload({ target: { files: [f] } });
          } else {
            showMessage("Будь ласка, виберіть файл зображення", "error");
          }
        }
      });
      uploadContainer.addEventListener("click", () => imageFile?.click());
    }
  }

  window.AdminPlantsModule = {
    loadPlants,
    savePlant,
    deletePlant,
    renderPlantsList,
    getPlantsData,
    setEditingPlantId,
    getEditingPlantId,
    showMessage,
    safeText,
    getCategoryLabel,
    editPlant,
    exportData,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI);
  } else {
    initUI();
  }
})();