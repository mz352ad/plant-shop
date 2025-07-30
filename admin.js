// Глобальні змінні
let plantsData = [];
let nextId = 1;

// DOM елементи
const addPlantForm = document.getElementById('addPlantForm');
const plantsList = document.getElementById('plantsList');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');
const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
const formSections = document.querySelectorAll('.form-section');

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    loadPlantsFromStorage();
    setupEventListeners();
    renderPlantsList();
});

// Налаштування обробників подій
function setupEventListeners() {
    // Навігація адмін-панелі
    adminNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
        });
    });

    // Форма додавання рослини
    addPlantForm.addEventListener('submit', handleAddPlant);
}

// Переключення між розділами
function switchSection(section) {
    // Оновлення активних кнопок
    adminNavBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Оновлення активних розділів
    formSections.forEach(formSection => {
        formSection.classList.toggle('active', formSection.id === section + 'Section');
    });

    // Оновлення списку рослин при переключенні
    if (section === 'list') {
        renderPlantsList();
    }
}

// Обробка додавання рослини
function handleAddPlant(e) {
    e.preventDefault();
    
    const formData = new FormData(addPlantForm);
    const plantData = {
        id: nextId++,
        name: document.getElementById('plantName').value,
        category: document.getElementById('plantCategory').value,
        categoryName: getCategoryName(document.getElementById('plantCategory').value),
        price: parseInt(document.getElementById('plantPrice').value),
        image: document.getElementById('plantImage').value || '🌿',
        description: document.getElementById('plantDescription').value,
        care: {
            lighting: document.getElementById('careLighting').value || 'Розсіяне світло',
            watering: document.getElementById('careWatering').value || 'Помірний полив',
            temperature: document.getElementById('careTemperature').value || '18-25°C',
            humidity: document.getElementById('careHumidity').value || 'Середня'
        },
        viber: document.getElementById('contactViber').value || '+380501234567',
        telegram: document.getElementById('contactTelegram').value || '@plantshop_ua'
    };

    // Валідація
    if (!plantData.name || !plantData.category || !plantData.price || !plantData.description) {
        showError('Будь ласка, заповніть всі обов\'язкові поля');
        return;
    }

    // Додавання рослини
    plantsData.push(plantData);
    savePlantsToStorage();
    
    // Очищення форми
    addPlantForm.reset();
    
    // Показ повідомлення про успіх
    showSuccess(`Рослину "${plantData.name}" успішно додано!`);
    
    // Оновлення списку
    renderPlantsList();
}

// Отримання назви категорії
function getCategoryName(category) {
    const categories = {
        'indoor': 'Кімнатні',
        'garden': 'Садові',
        'exotic': 'Екзотичні'
    };
    return categories[category] || 'Інші';
}

// Відображення списку рослин
function renderPlantsList() {
    if (plantsData.length === 0) {
        plantsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-seedling" style="font-size: 3rem; margin-bottom: 20px; color: #ccc;"></i>
                <h3>Рослини не знайдено</h3>
                <p>Додайте першу рослину через форму вище</p>
            </div>
        `;
        return;
    }

    plantsList.innerHTML = plantsData.map(plant => `
        <div class="plant-item" data-id="${plant.id}">
            <div class="plant-info">
                <div class="plant-name">${plant.name}</div>
                <div class="plant-category">${plant.categoryName} • ${plant.price} грн</div>
            </div>
            <div class="plant-actions">
                <button class="action-btn edit-btn" onclick="editPlant(${plant.id})">
                    <i class="fas fa-edit"></i> Редагувати
                </button>
                <button class="action-btn delete-btn" onclick="deletePlant(${plant.id})">
                    <i class="fas fa-trash"></i> Видалити
                </button>
            </div>
        </div>
    `).join('');
}

// Редагування рослини
function editPlant(plantId) {
    const plant = plantsData.find(p => p.id === plantId);
    if (!plant) return;

    // Заповнення форми даними рослини
    document.getElementById('plantName').value = plant.name;
    document.getElementById('plantCategory').value = plant.category;
    document.getElementById('plantPrice').value = plant.price;
    document.getElementById('plantImage').value = plant.image;
    document.getElementById('plantDescription').value = plant.description;
    document.getElementById('careLighting').value = plant.care.lighting;
    document.getElementById('careWatering').value = plant.care.watering;
    document.getElementById('careTemperature').value = plant.care.temperature;
    document.getElementById('careHumidity').value = plant.care.humidity;
    document.getElementById('contactViber').value = plant.viber;
    document.getElementById('contactTelegram').value = plant.telegram;

    // Зміна тексту кнопки
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Зберегти зміни';
    submitBtn.dataset.editId = plantId;

    // Переключення на форму
    switchSection('add');
    
    // Прокрутка до форми
    document.getElementById('addSection').scrollIntoView({ behavior: 'smooth' });
}

// Видалення рослини
function deletePlant(plantId) {
    if (!confirm('Ви впевнені, що хочете видалити цю рослину?')) {
        return;
    }

    const plantIndex = plantsData.findIndex(p => p.id === plantId);
    if (plantIndex === -1) return;

    const plantName = plantsData[plantIndex].name;
    plantsData.splice(plantIndex, 1);
    savePlantsToStorage();
    renderPlantsList();
    
    showSuccess(`Рослину "${plantName}" видалено`);
}

// Збереження рослин у localStorage
function savePlantsToStorage() {
    localStorage.setItem('plantsData', JSON.stringify(plantsData));
    localStorage.setItem('nextId', nextId.toString());
    
    // Оновлення даних на головній сторінці
    updateMainPageData();
}

// Завантаження рослин з localStorage
function loadPlantsFromStorage() {
    const savedPlants = localStorage.getItem('plantsData');
    const savedNextId = localStorage.getItem('nextId');
    
    if (savedPlants) {
        plantsData = JSON.parse(savedPlants);
    }
    
    if (savedNextId) {
        nextId = parseInt(savedNextId);
    } else {
        // Якщо немає збереженого nextId, встановлюємо його на основі існуючих рослин
        if (plantsData.length > 0) {
            nextId = Math.max(...plantsData.map(p => p.id)) + 1;
        } else {
            nextId = 1; // Початкове значення
        }
    }
}

// Оновлення даних на головній сторінці
function updateMainPageData() {
    // Відправка повідомлення на головну сторінку
    if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
            type: 'PLANTS_UPDATED',
            data: plantsData
        }, '*');
    }
}

// Показ повідомлення про успіх
function showSuccess(message) {
    successText.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Показ повідомлення про помилку
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// Експорт даних
function exportPlants() {
    const dataStr = JSON.stringify(plantsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plants-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Імпорт даних
function importPlants(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                plantsData = importedData;
                nextId = Math.max(...plantsData.map(p => p.id), 0) + 1;
                savePlantsToStorage();
                renderPlantsList();
                showSuccess('Дані успішно імпортовано!');
            } else {
                showError('Неправильний формат файлу');
            }
        } catch (error) {
            showError('Помилка при імпорті файлу');
        }
    };
    reader.readAsText(file);
}

// Додавання кнопок експорту/імпорту
document.addEventListener('DOMContentLoaded', function() {
    const adminNav = document.querySelector('.admin-nav');
    
    // Кнопка експорту
    const exportBtn = document.createElement('button');
    exportBtn.className = 'admin-nav-btn';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Експорт';
    exportBtn.onclick = exportPlants;
    adminNav.appendChild(exportBtn);
    
    // Кнопка імпорту
    const importBtn = document.createElement('button');
    importBtn.className = 'admin-nav-btn';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> Імпорт';
    importBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files[0]) {
                importPlants(e.target.files[0]);
            }
        };
        input.click();
    };
    adminNav.appendChild(importBtn);
});

// Обробка оновлення форми для редагування
addPlantForm.addEventListener('submit', function(e) {
    const submitBtn = document.querySelector('.submit-btn');
    const editId = submitBtn.dataset.editId;
    
    if (editId) {
        e.preventDefault();
        
        // Оновлення існуючої рослини
        const plantIndex = plantsData.findIndex(p => p.id === parseInt(editId));
        if (plantIndex === -1) return;
        
        plantsData[plantIndex] = {
            id: parseInt(editId),
            name: document.getElementById('plantName').value,
            category: document.getElementById('plantCategory').value,
            categoryName: getCategoryName(document.getElementById('plantCategory').value),
            price: parseInt(document.getElementById('plantPrice').value),
            image: document.getElementById('plantImage').value || '🌿',
            description: document.getElementById('plantDescription').value,
            care: {
                lighting: document.getElementById('careLighting').value || 'Розсіяне світло',
                watering: document.getElementById('careWatering').value || 'Помірний полив',
                temperature: document.getElementById('careTemperature').value || '18-25°C',
                humidity: document.getElementById('careHumidity').value || 'Середня'
            },
            viber: document.getElementById('contactViber').value || '+380501234567',
            telegram: document.getElementById('contactTelegram').value || '@plantshop_ua'
        };
        
        savePlantsToStorage();
        addPlantForm.reset();
        
        // Скидання режиму редагування
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Додати рослину';
        delete submitBtn.dataset.editId;
        
        showSuccess('Рослину успішно оновлено!');
        renderPlantsList();
    }
}); 