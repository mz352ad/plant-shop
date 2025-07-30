// Глобальні змінні
let plantsData = [];
let filteredPlants = [];
let cart = [];

// DOM елементи
let plantsGrid, searchInput, searchOverlay, searchBtn, closeSearch;
let plantModal, closeModal, plantDetails, cartCount;
let categoryBtns, tabBtns, adminBtn;

// Ініціалізація DOM елементів
function initializeDOMElements() {
    plantsGrid = document.getElementById('plantsGrid');
    searchInput = document.getElementById('searchInput');
    searchOverlay = document.getElementById('searchOverlay');
    searchBtn = document.getElementById('searchBtn');
    closeSearch = document.getElementById('closeSearch');
    plantModal = document.getElementById('plantModal');
    closeModal = document.getElementById('closeModal');
    plantDetails = document.getElementById('plantDetails');
    cartCount = document.getElementById('cartCount');
    categoryBtns = document.querySelectorAll('.category-btn');
    tabBtns = document.querySelectorAll('.tab-btn');
    adminBtn = document.getElementById('adminBtn');
}

// Завантаження рослин з Firebase
async function loadPlantsFromFirebase() {
    try {
        // Перевіряємо, чи Firebase ініціалізований
        if (typeof db === 'undefined') {
            console.log('Firebase не ініціалізований, використовуємо localStorage');
            loadPlantsFromStorage();
            return;
        }

        const snapshot = await db.collection('plants').get();
        plantsData = [];
        snapshot.forEach(doc => {
            const plant = { id: doc.id, ...doc.data() };
            plantsData.push(plant);
        });
        filteredPlants = [...plantsData];
        renderPlants();
    } catch (error) {
        console.error('Помилка завантаження рослин:', error);
        loadPlantsFromStorage();
    }
}

// Fallback функція для localStorage
function loadPlantsFromStorage() {
    const savedPlants = localStorage.getItem('plantsData');
    if (savedPlants) {
        plantsData = JSON.parse(savedPlants);
    }
    filteredPlants = [...plantsData];
    renderPlants();
}

// Відображення рослин
function renderPlants() {
    if (!plantsGrid) return;
    
    plantsGrid.innerHTML = '';

    if (filteredPlants.length === 0) {
        if (plantsData.length === 0) {
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
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.innerHTML = `
            <div class="plant-image">
                <span class="plant-emoji">${plant.image || '🌿'}</span>
            </div>
            <div class="plant-info">
                <h3 class="plant-name">${plant.name}</h3>
                <p class="plant-price">${plant.price} грн</p>
            </div>
        `;
        
        plantCard.addEventListener('click', () => showPlantDetails(plant));
        plantsGrid.appendChild(plantCard);
    });
}

// Показ деталей рослини
function showPlantDetails(plant) {
    if (!plantDetails || !plantModal) return;

    const categoryNames = {
        'indoor': 'Кімнатні',
        'garden': 'Садові',
        'exotic': 'Екзотичні'
    };

    plantDetails.innerHTML = `
        <div class="plant-detail-image">
            <span class="plant-emoji-large">${plant.image || '🌿'}</span>
        </div>
        <div class="plant-detail-info">
            <h2>${plant.name}</h2>
            <p class="plant-category">${categoryNames[plant.category] || plant.category}</p>
            <p class="plant-price-large">${plant.price} грн</p>
            <p class="plant-description">${plant.description || 'Опис рослини'}</p>
            <div class="plant-care">
                <h4>Догляд:</h4>
                <p>${plant.care || 'Інформація про догляд'}</p>
            </div>
            <div class="plant-actions">
                <button class="contact-btn viber-btn" onclick="contactViber('${plant.viber || '+380123456789}')">
                    <i class="fab fa-viber"></i> Viber
                </button>
                <button class="contact-btn telegram-btn" onclick="contactTelegram('${plant.telegram || '@plantshop'}')">
                    <i class="fab fa-telegram"></i> Telegram
                </button>
                <button class="add-to-cart-btn" onclick="addToCart('${plant.id}')">
                    <i class="fas fa-shopping-cart"></i> Додати в кошик
                </button>
            </div>
        </div>
    `;
    
    plantModal.classList.add('active');
}

// Контакт через Viber
function contactViber(phone) {
    window.open(`viber://chat?number=${phone}`, '_blank');
}

// Контакт через Telegram
function contactTelegram(username) {
    if (username.startsWith('@')) {
        username = username.substring(1);
    }
    window.open(`https://t.me/${username}`, '_blank');
}

// Додавання в кошик
function addToCart(plantId) {
    const plant = plantsData.find(p => p.id == plantId);
    if (!plant) return;

    const existingItem = cart.find(item => item.id == plantId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: plant.id,
            name: plant.name,
            price: plant.price,
            image: plant.image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveCartToStorage();
    showNotification('Рослину додано в кошик!');
}

// Оновлення відображення кошика
function updateCartDisplay() {
    if (!cartCount) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Збереження кошика в localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Завантаження кошика з localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Фільтрація за категоріями
function filterByCategory(category) {
    if (category === 'all') {
        filteredPlants = [...plantsData];
    } else {
        filteredPlants = plantsData.filter(plant => plant.category === category);
    }
    renderPlants();
}

// Пошук рослин
function searchPlants(query) {
    const lowerQuery = query.toLowerCase();
    filteredPlants = plantsData.filter(plant => 
        plant.name.toLowerCase().includes(lowerQuery) ||
        (plant.description && plant.description.toLowerCase().includes(lowerQuery))
    );
    renderPlants();
}

// Налаштування обробників подій
function setupEventListeners() {
    // Пошук
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            if (searchOverlay) {
                searchOverlay.classList.add('active');
                if (searchInput) searchInput.focus();
            }
        });
    }

    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            if (searchOverlay) {
                searchOverlay.classList.remove('active');
                if (searchInput) {
                    searchInput.value = '';
                    filteredPlants = [...plantsData];
                    renderPlants();
                }
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchPlants(e.target.value);
        });
    }

    // Модальне вікно
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (plantModal) plantModal.classList.remove('active');
        });
    }

    if (plantModal) {
        plantModal.addEventListener('click', (e) => {
            if (e.target === plantModal) {
                plantModal.classList.remove('active');
            }
        });
    }

    // Категорії
    if (categoryBtns) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterByCategory(btn.dataset.category);
            });
        });
    }

    // Тап-бар
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tab = btn.dataset.tab;
                if (tab === 'cart') {
                    showCart();
                } else if (tab === 'categories') {
                    // Показати категорії (вже показані)
                } else if (tab === 'home') {
                    // Повернутися до головної
                    filteredPlants = [...plantsData];
                    renderPlants();
                }
            });
        });
    }

    // Адмін-панель
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            window.open('admin.html', '_blank');
        });
    }
}

// Показ кошика
function showCart() {
    if (!plantsGrid) return;

    if (cart.length === 0) {
        plantsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Кошик порожній</h3>
                <p>Додайте рослини в кошик для покупки</p>
            </div>
        `;
        return;
    }

    plantsGrid.innerHTML = '';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <span class="plant-emoji">${item.image || '🌿'}</span>
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.price} грн</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
            <div class="cart-item-total">
                ${item.price * item.quantity} грн
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        plantsGrid.appendChild(cartItem);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.createElement('div');
    totalElement.className = 'cart-total';
    totalElement.innerHTML = `
        <h3>Загальна сума: ${total} грн</h3>
        <button class="checkout-btn" onclick="checkout()">
            <i class="fas fa-credit-card"></i> Оформити замовлення
        </button>
    `;
    plantsGrid.appendChild(totalElement);
}

// Оновлення кількості в кошику
function updateQuantity(plantId, change) {
    const item = cart.find(item => item.id == plantId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(plantId);
        } else {
            updateCartDisplay();
            saveCartToStorage();
            showCart();
        }
    }
}

// Видалення з кошика
function removeFromCart(plantId) {
    cart = cart.filter(item => item.id != plantId);
    updateCartDisplay();
    saveCartToStorage();
    showCart();
}

// Оформлення замовлення
function checkout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Замовлення на суму ${total} грн оформлено! Зв'яжіться з нами через Viber або Telegram для підтвердження.`);
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
    showCart();
}

// Синхронізація з адмін-панеллю
window.addEventListener('message', (event) => {
    if (event.data.type === 'PLANTS_UPDATED') {
        loadPlantsFromFirebase();
    }
});

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    setupEventListeners();
    loadPlantsFromFirebase();
    loadCartFromStorage();
}); 