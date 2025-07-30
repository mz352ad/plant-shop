// Глобальні змінні
let plantsData = [];
let editingPlantId = null;

// DOM елементи
const addPlantForm = document.getElementById('addPlantForm');
const plantsList = document.getElementById('plantsList');
const messageContainer = document.getElementById('message-container');
const navBtns = document.querySelectorAll('.nav-btn');
const adminSections = document.querySelectorAll('.admin-section');
const importFile = document.getElementById('importFile');
const imageFile = document.getElementById('imageFile');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');

// Фіксовані контакти
const FIXED_VIBER = '+380966970439';
const FIXED_TELEGRAM = '+380966970439';

// Завантаження рослин з Firebase
async function loadPlantsFromFirebase() {
    try {
        const snapshot = await db.collection('plants').get();
        plantsData = [];
        snapshot.forEach(doc => {
            const plant = { id: doc.id, ...doc.data() };
            plantsData.push(plant);
        });
        renderPlantsList();
    } catch (error) {
        console.error('Помилка завантаження рослин:', error);
        showMessage('Помилка завантаження рослин', 'error');
    }
}

// Збереження рослини в Firebase
async function savePlantToFirebase(plant) {
    try {
        if (plant.id) {
            // Оновлення існуючої рослини
            await db.collection('plants').doc(plant.id).update(plant);
        } else {
            // Додавання нової рослини
            const docRef = await db.collection('plants').add(plant);
            plant.id = docRef.id;
        }
        await loadPlantsFromFirebase(); // Перезавантажити дані
        return true;
    } catch (error) {
        console.error('Помилка збереження рослини:', error);
        return false;
    }
}

// Видалення рослини з Firebase
async function deletePlantFromFirebase(plantId) {
    try {
        await db.collection('plants').doc(plantId).delete();
        await loadPlantsFromFirebase(); // Перезавантажити дані
        return true;
    } catch (error) {
        console.error('Помилка видалення рослини:', error);
        return false;
    }
}

// Показ повідомлення
function showMessage(message, type = 'success') {
    messageContainer.innerHTML = `
        <div class="message ${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 5000);
}

// Відображення списку рослин
function renderPlantsList() {
    if (plantsData.length === 0) {
        plantsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-seedling" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Рослини ще не додані</h3>
                <p>Додайте першу рослину через форму вище</p>
            </div>
        `;
        return;
    }

    plantsList.innerHTML = '';
    
    plantsData.forEach(plant => {
        const plantItem = document.createElement('div');
        plantItem.className = 'plant-item';
        
        const categoryNames = {
            'indoor': 'Кімнатні',
            'garden': 'Садові',
            'exotic': 'Екзотичні'
        };

        plantItem.innerHTML = `
            <div class="plant-header">
                <h3 class="plant-name">${plant.name}</h3>
                <div class="plant-actions">
                    <button class="btn btn-secondary" onclick="editPlant('" + plant.id + "')">
                        <i class="fas fa-edit"></i> Редагувати
                    </button>
                    <button class="btn btn-danger" onclick="deletePlant('" + plant.id + "')">
                        <i class="fas fa-trash"></i> Видалити
                    </button>
                </div>
            </div>
            <div class="plant-info">
                <div class="info-item">
                    <span class="info-label">Категорія</span>
                    <span class="info-value">${categoryNames[plant.category] || plant.category}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ціна</span>
                    <span class="info-value">${plant.price} грн</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Зображення</span>
                    <span class="info-value">${plant.image || '🌿'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Viber</span>
                    <span class="info-value">${plant.viber || 'Не вказано'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Telegram</span>
                    <span class="info-value">${plant.telegram || 'Не вказано'}</span>
                </div>
            </div>
            ${plant.description ? `
                <div class="info-item">
                    <span class="info-label">Опис</span>
                    <span class="info-value">${plant.description}</span>
                </div>
            ` : ''}
            ${plant.care ? `
                <div class="info-item">
                    <span class="info-label">Догляд</span>
                    <span class="info-value">${plant.care}</span>
                </div>
            ` : ''}
        `;
        
        plantsList.appendChild(plantItem);
    });
}

// Редагування рослини
function editPlant(plantId) {
    const plant = plantsData.find(p => p.id === plantId);
    if (!plant) return;

    editingPlantId = plantId;
    
    // Заповнити форму даними рослини
    document.getElementById('plantName').value = plant.name || '';
    document.getElementById('plantCategory').value = plant.category || '';
    document.getElementById('plantPrice').value = plant.price || '';
    document.getElementById('plantImage').value = plant.image || '';
    document.getElementById('plantDescription').value = plant.description || '';
    document.getElementById('plantCare').value = plant.care || '';
    document.getElementById('plantViber').value = FIXED_VIBER;
    document.getElementById('plantTelegram').value = FIXED_TELEGRAM;
    
    // Показати попередній перегляд зображення якщо воно є
    if (plant.image && plant.image.startsWith('data:image')) {
        previewImg.src = plant.image;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
    }
    
    // Змінити текст кнопки
    const submitBtn = addPlantForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Зберегти зміни';
    
    // Перейти до секції додавання
    showSection('add');
    
    // Прокрутити до форми
    document.getElementById('add-section').scrollIntoView({ behavior: 'smooth' });
}

// Видалення рослини
async function deletePlant(plantId) {
    if (!confirm('Ви впевнені, що хочете видалити цю рослину?')) {
        return;
    }

    const success = await deletePlantFromFirebase(plantId);
    if (success) {
        showMessage('Рослину успішно видалено!');
        // Повідомити головну сторінку про оновлення
        if (window.opener) {
            window.opener.postMessage({ type: 'PLANTS_UPDATED' }, '*');
        }
    } else {
        showMessage('Помилка при видаленні рослини', 'error');
    }
}

// Обробка форми
addPlantForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addPlantForm);
    const plant = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseInt(formData.get('price')),
        image: formData.get('image'),
        description: formData.get('description'),
        care: formData.get('care'),
        viber: FIXED_VIBER,
        telegram: FIXED_TELEGRAM
    };

    // Додати ID якщо це редагування
    if (editingPlantId) {
        plant.id = editingPlantId;
    }

    const success = await savePlantToFirebase(plant);
    
    if (success) {
        showMessage(editingPlantId ? 'Рослину успішно оновлено!' : 'Рослину успішно додано!');
        addPlantForm.reset();
        editingPlantId = null;
        
        // Повернути оригінальний текст кнопки
        const submitBtn = addPlantForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Додати рослину';
        
        // Повідомити головну сторінку про оновлення
        if (window.opener) {
            window.opener.postMessage({ type: 'PLANTS_UPDATED' }, '*');
        }
    } else {
        showMessage('Помилка при збереженні рослини', 'error');
    }
});

// Перемикання між секціями
function showSection(sectionName) {
    // Оновити активні кнопки
    navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });
    
    // Оновити активні секції
    adminSections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });
}

// Обробники кліків по навігації
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        showSection(btn.dataset.section);
    });
});

// Експорт даних
function exportData() {
    const dataStr = JSON.stringify(plantsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `plants-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Дані експортовано успішно!');
}

// Імпорт даних
importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const importedData = JSON.parse(text);
        
        if (!Array.isArray(importedData)) {
            throw new Error('Неправильний формат файлу');
        }

        // Додати кожну рослину в Firebase
        let successCount = 0;
        for (const plant of importedData) {
            // Видалити ID щоб створити нові документи
            delete plant.id;
            const success = await savePlantToFirebase(plant);
            if (success) successCount++;
        }

        showMessage(`Імпортовано ${successCount} з ${importedData.length} рослин`);
        
        // Очистити input
        importFile.value = '';
        
    } catch (error) {
        console.error('Помилка імпорту:', error);
        showMessage('Помилка при імпорті файлу', 'error');
        importFile.value = '';
    }
});

// Функції для роботи з фото
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            document.getElementById('plantImage').value = imageData;
            previewImg.src = imageData;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function removeImagePreview() {
    document.getElementById('plantImage').value = '';
    imagePreview.style.display = 'none';
    imageFile.value = '';
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadPlantsFromFirebase();
    
    // Обробники для завантаження фото
    imageFile.addEventListener('change', handleImageUpload);
    removeImage.addEventListener('click', removeImagePreview);
    
    // Встановлюємо фіксовані контакти
    document.getElementById('plantViber').value = FIXED_VIBER;
    document.getElementById('plantTelegram').value = FIXED_TELEGRAM;
    document.getElementById('plantViber').readOnly = true;
    document.getElementById('plantTelegram').readOnly = true;
}); 