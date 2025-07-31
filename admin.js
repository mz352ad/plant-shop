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
        console.log('Loading plants from Firebase...');
        if (!db) {
            console.error('Firebase db is not initialized');
            showMessage('Помилка: Firebase не ініціалізований', 'error');
            return;
        }
        const snapshot = await db.collection('plants').get();
        plantsData = [];
        snapshot.forEach(doc => {
            const plant = { id: doc.id, ...doc.data() };
            plantsData.push(plant);
        });
        console.log('Plants loaded successfully:', plantsData);
        renderPlantsList();
    } catch (error) {
        console.error('Помилка завантаження рослин:', error);
        showMessage('Помилка завантаження рослин: ' + error.message, 'error');
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
    console.log('renderPlantsList called, plantsData:', plantsData);
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
                    <button class="btn btn-secondary" onclick="editPlant('${plant.id}')">
                        <i class="fas fa-edit"></i> Редагувати
                    </button>
                    <button class="btn btn-danger" onclick="deletePlant('${plant.id}')">
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
                    <span class="info-value">
                        ${plant.promoPrice ? 
                            `<span style="text-decoration: line-through; color: #999;">${plant.price} грн</span><br>
                             <span style="color: #e91e63; font-weight: bold;">${plant.promoPrice} грн</span>
                             ${plant.promoEndDate ? `<br><small>до ${new Date(plant.promoEndDate).toLocaleDateString('uk-UA')}</small>` : ''}` 
                            : `${plant.price} грн`
                        }
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Зображення</span>
                    <span class="info-value">
                        ${plant.image ? 
                            (plant.image.startsWith('data:image') ? 
                                `<img src="${plant.image}" alt="Зображення рослини" style="max-width: 100px; max-height: 100px; border-radius: 8px; object-fit: cover; border: 2px solid #e8f5e8;">` : 
                                plant.image
                            ) : 
                            '🌿'
                        }
                    </span>
                </div>

            </div>
            ${plant.description ? `
                <div class="info-item">
                    <span class="info-label">Опис</span>
                    <span class="info-value">${plant.description}</span>
                </div>
            ` : ''}

        `;
        
        plantsList.appendChild(plantItem);
    });
}

// Редагування рослини
function editPlant(plantId) {
    console.log('editPlant called with ID:', plantId);
    const plant = plantsData.find(p => p.id === plantId);
    if (!plant) {
        console.log('Plant not found with ID:', plantId);
        return;
    }

    editingPlantId = plantId;
    
    // Заповнити форму даними рослини
    document.getElementById('plantName').value = plant.name || '';
    document.getElementById('plantCategory').value = plant.category || '';
    document.getElementById('plantPrice').value = plant.price || '';
    document.getElementById('plantPromoPrice').value = plant.promoPrice || '';
    document.getElementById('plantPromoEndDate').value = plant.promoEndDate || '';
    document.getElementById('plantImage').value = plant.image || '';
    document.getElementById('plantDescription').value = plant.description || '';
    
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
    console.log('deletePlant called with ID:', plantId);
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
        promoPrice: formData.get('promoPrice') ? parseInt(formData.get('promoPrice')) : null,
        promoEndDate: formData.get('promoEndDate') || null,
        image: formData.get('image'),
        description: formData.get('description'),
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
        // Перевірка розміру файлу (максимум 500KB)
        const maxSize = 500 * 1024; // 500KB
        if (file.size > maxSize) {
            showMessage('Файл занадто великий. Максимальний розмір: 500KB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            document.getElementById('plantImage').value = imageData;
            previewImg.src = imageData;
            imagePreview.style.display = 'block';
            showMessage('Фото успішно завантажено!', 'success');
        };
        reader.onerror = function() {
            showMessage('Помилка при завантаженні фото', 'error');
        };
        reader.readAsDataURL(file);
    }
}

function removeImagePreview() {
    document.getElementById('plantImage').value = '';
    imagePreview.style.display = 'none';
    imageFile.value = '';
    showMessage('Фото видалено', 'success');
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing admin panel...');
    
    // Check if all required elements exist
    if (!addPlantForm) console.error('addPlantForm not found');
    if (!plantsList) console.error('plantsList not found');
    if (!messageContainer) console.error('messageContainer not found');
    if (!imageFile) console.error('imageFile not found');
    if (!imagePreview) console.error('imagePreview not found');
    if (!previewImg) console.error('previewImg not found');
    if (!removeImage) console.error('removeImage not found');
    
    // Expose functions to global scope
    window.editPlant = editPlant;
    window.deletePlant = deletePlant;
    window.exportData = exportData;
    
    console.log('Functions exposed to global scope:', {
        editPlant: typeof window.editPlant,
        deletePlant: typeof window.deletePlant,
        exportData: typeof window.exportData
    });
    
    loadPlantsFromFirebase();
    
    // Обробники для завантаження фото
    imageFile.addEventListener('change', handleImageUpload);
    removeImage.addEventListener('click', removeImagePreview);
    
    // Drag and drop функціональність
    const uploadContainer = document.getElementById('uploadContainer');
    
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('dragover');
    });
    
    uploadContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
    });
    
    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                imageFile.files = files;
                handleImageUpload({ target: { files: [file] } });
            } else {
                showMessage('Будь ласка, виберіть файл зображення', 'error');
            }
        }
    });
    
    // Клік по контейнеру для вибору файлу
    uploadContainer.addEventListener('click', () => {
        imageFile.click();
    });
}); 