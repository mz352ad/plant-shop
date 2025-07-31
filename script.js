// Глобальні змінні
let plantsData = [];
let filteredPlants = [];
let cart = [];

// Логування для діагностики
console.log('Script.js завантажений');
console.log('Поточний URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);

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
        console.log('Спроба завантаження з Firebase...');
        console.log('db доступний:', typeof db !== 'undefined');
        console.log('firebase доступний:', typeof firebase !== 'undefined');
        
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
        
        // Визначаємо, чи це зображення або емодзі
        const isImage = plant.image && plant.image.startsWith('data:image');
        
        plantCard.innerHTML = `
            <div class="plant-image">
                ${isImage ? 
                    `<img src="${plant.image}" alt="${plant.name}" class="plant-img">` : 
                    `<span class="plant-emoji">${plant.image || '🌿'}</span>`
                }
            </div>
            <div class="plant-info">
                <h3 class="plant-name">${plant.name}</h3>
                <p class="plant-price">
                    ${plant.promoPrice ? 
                        `<span style="text-decoration: line-through; color: #999; font-size: 0.9em;">${plant.price} грн</span><br>
                         <span style="color: #e91e63; font-weight: bold;">${plant.promoPrice} грн</span>` 
                        : `${plant.price} грн`
                    }
                </p>
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

    // Визначаємо, чи це зображення або емодзі
    const isImage = plant.image && plant.image.startsWith('data:image');
    
    plantDetails.innerHTML = `
        <div class="plant-detail-image">
            ${isImage ? 
                `<img src="${plant.image}" alt="${plant.name}" class="plant-detail-img">` : 
                `<span class="plant-emoji-large">${plant.image || '🌿'}</span>`
            }
        </div>
        <div class="plant-detail-info">
            <div class="product-header">
                <div class="availability">
                    <i class="fas fa-check-circle"></i>
                    <span>В наявності</span>
                </div>
                <div class="article-number">
                    Артикул: ${plant.id ? plant.id.substring(0, 4) : '0000'}
                </div>
            </div>
            
            <h2 class="plant-detail-name">${plant.name}</h2>
            <p class="plant-category">${categoryNames[plant.category] || plant.category}</p>
            
            <div class="pricing-section">
                ${plant.promoPrice ? `
                    <div class="price-promo">
                        <span class="price-main">${plant.promoPrice} ₴</span>
                        <span class="price-period">акційна ціна</span>
                    </div>
                    <div class="price-regular">
                        <span class="price-old">${plant.price} ₴</span>
                        <span class="price-period">${plant.promoEndDate ? `до ${new Date(plant.promoEndDate).toLocaleDateString('uk-UA')}` : 'звичайна ціна'}</span>
                    </div>
                ` : `
                    <div class="price-promo">
                        <span class="price-main">${plant.price} ₴</span>
                        <span class="price-period">звичайна ціна</span>
                    </div>
                `}
            </div>
            
            <button class="add-to-cart-btn" onclick="addToCart('${plant.id}')">
                <i class="fas fa-shopping-cart"></i> До кошику
            </button>
            
            <div class="quick-order-section">
                <h4>Швидке замовлення <i class="fas fa-info-circle"></i></h4>
                <div class="contact-icons">
                    <button class="contact-icon-btn viber-icon" onclick="contactViber('+380966970439')">
                        <i class="fab fa-viber"></i>
                    </button>
                    <button class="contact-icon-btn telegram-icon" onclick="contactTelegram('+380966970439')">
                        <i class="fab fa-telegram"></i>
                    </button>
                </div>
            </div>
            
            <div class="product-description">
                <h4>Опис:</h4>
                <p>${plant.description || 'Опис рослини'}</p>
            </div>
        </div>
    `;
    
    plantModal.classList.add('active');
}

// Контакт через Viber
function contactViber(phone) {
    window.open('viber://chat?number=' + phone, '_blank');
}

// Контакт через Telegram
function contactTelegram(phone) {
    // Зберігаємо + для правильного формату Telegram URL
    window.open('https://t.me/' + phone, '_blank');
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
            price: plant.promoPrice || plant.price,
            originalPrice: plant.price,
            promoPrice: plant.promoPrice,
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
        background: #2e7d32;
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
        
        // Визначаємо, чи це зображення або емодзі
        const isImage = item.image && item.image.startsWith('data:image');
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                ${isImage ? 
                    `<img src="${item.image}" alt="${item.name}" class="cart-item-img">` : 
                    `<span class="plant-emoji">${item.image || '🌿'}</span>`
                }
            </div>
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>
                    ${item.promoPrice ? 
                        `<span style="text-decoration: line-through; color: #999;">${item.originalPrice} грн</span><br>
                         <span style="color: #e91e63; font-weight: bold;">${item.price} грн</span>` 
                        : `${item.price} грн`
                    }
                </p>
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
    alert('Замовлення на суму ' + total + ' грн оформлено! Зв\'яжіться з нами через Viber або Telegram для підтвердження.');
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
    console.log('DOM завантажений, починаємо ініціалізацію...');
    initializeDOMElements();
    setupEventListeners();
    loadPlantsFromFirebase();
    loadCartFromStorage();
    console.log('Ініціалізація завершена');
});

// Додаткове логування для діагностики
console.log('Script.js повністю завантажений'); 