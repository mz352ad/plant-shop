// Порожній масив для даних рослин (заповнюється через адмін-панель)
let plantsData = [];

// Завантаження даних з localStorage
function loadPlantsFromStorage() {
    const savedPlants = localStorage.getItem('plantsData');
    if (savedPlants) {
        plantsData = JSON.parse(savedPlants);
    }
    // Оновлення відфільтрованих рослин
    filteredPlants = [...plantsData];
}

// Оновлення даних з адмін-панелі
function updatePlantsFromAdmin(newData) {
    plantsData = newData;
    filteredPlants = [...plantsData];
    renderPlants();
}

// Глобальні змінні
let currentCategory = 'all';
let cart = [];
let filteredPlants = [...plantsData];

// DOM елементи
const plantsGrid = document.getElementById('plantsGrid');
const categoryBtns = document.querySelectorAll('.category-btn');
const searchBtn = document.getElementById('searchBtn');
const adminBtn = document.getElementById('adminBtn');
const searchOverlay = document.getElementById('searchOverlay');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const plantModal = document.getElementById('plantModal');
const closeModal = document.getElementById('closeModal');
const plantDetails = document.getElementById('plantDetails');
const cartCount = document.getElementById('cartCount');
const tabBtns = document.querySelectorAll('.tab-btn');

// Ініціалізація
document.addEventListener('DOMContentLoaded', function() {
    loadPlantsFromStorage();
    renderPlants();
    setupEventListeners();
    updateCartCount();
    setupAdminCommunication();
});

// Налаштування обробників подій
function setupEventListeners() {
    // Категорії
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterByCategory(category);
            
            // Оновлення активного стану
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Пошук
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
    });

    // Адмін-панель
    adminBtn.addEventListener('click', () => {
        window.open('admin.html', '_blank', 'width=900,height=700');
    });

    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        renderPlants();
    });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterBySearch(query);
    });

    // Модальне вікно
    closeModal.addEventListener('click', () => {
        plantModal.classList.remove('active');
    });

    plantModal.addEventListener('click', (e) => {
        if (e.target === plantModal) {
            plantModal.classList.remove('active');
        }
    });

    // Тап-бар
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            handleTabClick(tab);
            
            // Оновлення активного стану
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Налаштування комунікації з адмін-панеллю
function setupAdminCommunication() {
    // Слухання повідомлень від адмін-панелі
    window.addEventListener('message', function(event) {
        if (event.data.type === 'PLANTS_UPDATED') {
            updatePlantsFromAdmin(event.data.data);
        }
    });
}

// Фільтрація за категорією
function filterByCategory(category) {
    currentCategory = category;
    if (category === 'all') {
        filteredPlants = [...plantsData];
    } else {
        filteredPlants = plantsData.filter(plant => plant.category === category);
    }
    renderPlants();
}

// Фільтрація за пошуком
function filterBySearch(query) {
    if (query === '') {
        if (currentCategory === 'all') {
            filteredPlants = [...plantsData];
        } else {
            filteredPlants = plantsData.filter(plant => plant.category === currentCategory);
        }
    } else {
        filteredPlants = plantsData.filter(plant => 
            (currentCategory === 'all' || plant.category === currentCategory) &&
            (plant.name.toLowerCase().includes(query) || 
             plant.description.toLowerCase().includes(query))
        );
    }
    renderPlants();
}

// Відображення рослин
function renderPlants() {
    plantsGrid.innerHTML = '';
    
    if (filteredPlants.length === 0) {
        // Перевіряємо, чи це результат фільтрації чи просто немає рослин
        if (plantsData.length === 0) {
            // Немає рослин взагалі
            plantsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-seedling" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Рослини ще не додані</h3>
                    <p>Використайте адмін-панель для додавання рослин</p>
                    <button class="admin-panel-btn" onclick="document.getElementById('adminBtn').click()">
                        <i class="fas fa-cog"></i> Відкрити адмін-панель
                    </button>
                </div>
            `;
        } else {
            // Результат фільтрації
            plantsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>Рослини не знайдено</h3>
                    <p>Спробуйте змінити категорію або пошуковий запит</p>
                </div>
            `;
        }
        return;
    }

    filteredPlants.forEach(plant => {
        const plantCard = createPlantCard(plant);
        plantsGrid.appendChild(plantCard);
    });
}

// Створення картки рослини
function createPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.innerHTML = `
        <div class="plant-image">
            ${plant.image}
        </div>
        <div class="plant-info">
            <div class="plant-name">${plant.name}</div>
            <div class="plant-category">${plant.categoryName}</div>
            <div class="plant-price">${plant.price} грн</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        showPlantDetails(plant);
    });
    
    return card;
}

// Показ деталей рослини
function showPlantDetails(plant) {
    plantDetails.innerHTML = `
        <div class="plant-detail-image">
            ${plant.image}
        </div>
        <h1 class="plant-detail-name">${plant.name}</h1>
        <div class="plant-detail-price">${plant.price} грн</div>
        <div class="plant-detail-category">${plant.categoryName}</div>
        <p class="plant-detail-description">${plant.description}</p>
        
        <div class="care-info">
            <h3><i class="fas fa-info-circle"></i> Догляд</h3>
            <div class="care-item">
                <span class="care-label">Освітлення:</span>
                <span class="care-value">${plant.care.lighting}</span>
            </div>
            <div class="care-item">
                <span class="care-label">Полив:</span>
                <span class="care-value">${plant.care.watering}</span>
            </div>
            <div class="care-item">
                <span class="care-label">Температура:</span>
                <span class="care-value">${plant.care.temperature}</span>
            </div>
            <div class="care-item">
                <span class="care-label">Вологість:</span>
                <span class="care-value">${plant.care.humidity}</span>
            </div>
        </div>
        
        <div class="contact-buttons">
            <button class="contact-btn viber-btn" onclick="contactViber('${plant.viber}')">
                <i class="fab fa-viber"></i>
                Viber
            </button>
            <button class="contact-btn telegram-btn" onclick="contactTelegram('${plant.telegram}')">
                <i class="fab fa-telegram"></i>
                Telegram
            </button>
        </div>
        
        <button class="add-to-cart-btn" onclick="addToCart(${plant.id})">
            <i class="fas fa-shopping-cart"></i>
            Додати в кошик
        </button>
    `;
    
    plantModal.classList.add('active');
}

// Контакт через Viber
function contactViber(phone) {
    const viberUrl = `viber://chat?number=${phone.replace('+', '')}`;
    window.open(viberUrl, '_blank');
}

// Контакт через Telegram
function contactTelegram(username) {
    const telegramUrl = `https://t.me/${username.replace('@', '')}`;
    window.open(telegramUrl, '_blank');
}

// Додавання в кошик
function addToCart(plantId) {
    const plant = plantsData.find(p => p.id === plantId);
    if (plant) {
        const existingItem = cart.find(item => item.id === plantId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...plant,
                quantity: 1
            });
        }
        updateCartCount();
        showNotification(`${plant.name} додано в кошик!`);
    }
}

// Оновлення лічильника кошика
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Показ повідомлення
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 5000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Обробка кліків по тап-бару
function handleTabClick(tab) {
    switch(tab) {
        case 'home':
            // Повернення до головної сторінки
            currentCategory = 'all';
            filteredPlants = [...plantsData];
            renderPlants();
            categoryBtns.forEach((btn, index) => {
                btn.classList.toggle('active', index === 0);
            });
            break;
            
        case 'categories':
            // Показ категорій (можна додати додаткову функціональність)
            showNotification('Категорії вже відображені вище');
            break;
            
        case 'cart':
            // Показ кошика
            showCart();
            break;
            
        case 'profile':
            // Показ профілю
            showProfile();
            break;
    }
}

// Показ кошика
function showCart() {
    if (cart.length === 0) {
        showNotification('Кошик порожній');
        return;
    }
    
    let cartContent = '<h2>Кошик</h2>';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartContent += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.price} грн × ${item.quantity}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartContent += `
        <div class="cart-total">
            <h3>Загалом: ${total} грн</h3>
            <button class="checkout-btn" onclick="checkout()">
                Оформити замовлення
            </button>
        </div>
    `;
    
    plantDetails.innerHTML = cartContent;
    plantModal.classList.add('active');
}

// Оновлення кількості в кошику
function updateQuantity(plantId, change) {
    const item = cart.find(item => item.id === plantId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(plantId);
        } else {
            updateCartCount();
            showCart(); // Оновлюємо відображення кошика
        }
    }
}

// Видалення з кошика
function removeFromCart(plantId) {
    cart = cart.filter(item => item.id !== plantId);
    updateCartCount();
    showCart(); // Оновлюємо відображення кошика
}

// Оформлення замовлення
function checkout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `Нове замовлення!\n\n${cart.map(item => `${item.name} × ${item.quantity} = ${item.price * item.quantity} грн`).join('\n')}\n\nЗагалом: ${total} грн`;
    
    // Відправка в Telegram
    const telegramUrl = `https://t.me/plantshop_ua?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
    
    // Очищення кошика
    cart = [];
    updateCartCount();
    plantModal.classList.remove('active');
    showNotification('Замовлення відправлено!');
}

// Показ профілю
function showProfile() {
    plantDetails.innerHTML = `
        <h2>Профіль</h2>
        <div class="profile-info">
            <div class="profile-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h3>Користувач</h3>
            <p>Ласкаво просимо до PlantShop!</p>
        </div>
        
        <div class="profile-stats">
            <div class="stat-item">
                <i class="fas fa-shopping-cart"></i>
                <span>Загалом замовлень: ${cart.length}</span>
            </div>
            <div class="stat-item">
                <i class="fas fa-heart"></i>
                <span>Улюблені рослини: 0</span>
            </div>
        </div>
        
        <div class="profile-actions">
            <button class="profile-btn">
                <i class="fas fa-cog"></i>
                Налаштування
            </button>
            <button class="profile-btn">
                <i class="fas fa-question-circle"></i>
                Допомога
            </button>
        </div>
    `;
    
    plantModal.classList.add('active');
}

// Додавання CSS для анімацій
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item-info h3 {
        margin: 0 0 5px 0;
        color: #333;
    }
    
    .cart-item-info p {
        margin: 0;
        color: #666;
    }
    
    .cart-item-actions {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .cart-item-actions button {
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        width: 30px;
        height: 30px;
        cursor: pointer;
    }
    
    .remove-btn {
        background: #ff4444 !important;
    }
    
    .cart-total {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #eee;
        text-align: center;
    }
    
    .checkout-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 15px;
    }
    
    .profile-info {
        text-align: center;
        margin-bottom: 30px;
    }
    
    .profile-avatar {
        width: 80px;
        height: 80px;
        background: #4CAF50;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        color: white;
        font-size: 2rem;
    }
    
    .profile-stats {
        margin-bottom: 30px;
    }
    
    .stat-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .stat-item i {
        color: #4CAF50;
        width: 20px;
    }
    
    .profile-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .profile-btn {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        padding: 15px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: background-color 0.3s;
    }
    
    .profile-btn:hover {
        background: #e9ecef;
    }
`;
document.head.appendChild(style); 