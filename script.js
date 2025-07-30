// Глобальні змінні
let plantsData = [];
let filteredPlants = [];
let cart = [];

// DOM елементи
const plantsGrid = document.getElementById('plantsGrid');
const searchInput = document.getElementById('searchInput');
const searchOverlay = document.getElementById('searchOverlay');
const searchBtn = document.getElementById('searchBtn');
const closeSearch = document.getElementById('closeSearch');
const plantModal = document.getElementById('plantModal');
const closeModal = document.getElementById('closeModal');
const plantDetails = document.getElementById('plantDetails');
const cartCount = document.getElementById('cartCount');
const categoryBtns = document.querySelectorAll('.category-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const adminBtn = document.getElementById('adminBtn');

// Завантаження рослин з Firebase
async function loadPlantsFromFirebase() {
    try {
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
        // Fallback до localStorage якщо Firebase недоступний
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
                <button class="add-to-cart-btn" onclick="addToCart(${plant.id})">
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
    
    // Показати повідомлення про успіх
    showNotification('Рослину додано в кошик!');
}

// Оновлення відображення кошика
function updateCartDisplay() {
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
        plant.description.toLowerCase().includes(lowerQuery)
    );
    renderPlants();
}

// Обробники подій
searchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    searchInput.focus();
});

closeSearch.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    filteredPlants = [...plantsData];
    renderPlants();
});

searchInput.addEventListener('input', (e) => {
    searchPlants(e.target.value);
});

closeModal.addEventListener('click', () => {
    plantModal.classList.remove('active');
});

plantModal.addEventListener('click', (e) => {
    if (e.target === plantModal) {
        plantModal.classList.remove('active');
    }
});

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterByCategory(btn.dataset.category);
    });
});

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

adminBtn.addEventListener('click', () => {
    window.open('admin.html', '_blank');
});

// Показ кошика
function showCart() {
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
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                ${item.price * item.quantity} грн
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
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
            showCart(); // Оновити відображення кошика
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
    loadPlantsFromFirebase();
    loadCartFromStorage();
}); 