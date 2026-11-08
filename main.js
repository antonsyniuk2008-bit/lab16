const globalStoreProducts = [
    { id: 1, title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops", price: 109.95, image: "https://unsplash.com" },
    { id: 2, title: "Mens Casual Premium Slim Fit T-Shirts", price: 22.30, image: "https://unsplash.com" },
    { id: 3, title: "Mens Cotton Jacket - Спортивна Куртка", price: 55.99, image: "https://unsplash.com" },
    { id: 4, title: "Mens Casual Slim Fit - Штани повсякденні", price: 15.99, image: "https://unsplash.com" },
    { id: 5, title: "Ноутбук Apple MacBook Pro 16", price: 2499.00, image: "https://unsplash.com" },
    { id: 6, title: "Смартфон Samsung Galaxy S24 Ultra", price: 1199.00, image: "https://unsplash.com" },
    { id: 7, title: "Навушники Sony WH-1000XM5", price: 349.99, image: "https://unsplash.com" },
    { id: 8, title: "Ігровий Монітор LG UltraGear 27", price: 299.50, image: "https://unsplash.com" },
    { id: 9, title: "Ігрова миша Razer DeathAdder Essential", price: 29.99, image: "https://unsplash.com + '39e7'?q=80&w=300" }
];

const THEME_STORAGE_KEY = 'techshop_theme';
const CART_STORAGE_KEY = 'techshop_cart';
const FAVORITES_STORAGE_KEY = 'techshop_favorites';
const FORM_STORAGE_KEY = 'techshop_checkout_draft';

const productsGrid = document.querySelector(".products-grid"); 
const cartButton = document.querySelector(".btn-cart"); 
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalSum = document.getElementById("cartTotalSum");
const cartCounter = document.querySelector(".cart-counter");
const favoritesZone = document.getElementById("favoritesZone");
const searchInput = document.getElementById('searchInput');
const searchResultCount = document.getElementById('searchResultCount');
const orderForm = document.getElementById('checkoutOrderForm');
const themeToggleBtn = document.getElementById("themeToggleBtn");

let cart = [];
let favoriteProductIds = [];

function loadCartFromStorage() {
    try {
        const rawData = localStorage.getItem(CART_STORAGE_KEY);
        if (!rawData) return [];
        const parsedCart = JSON.parse(rawData);
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) { return []; }
}

function loadFavoritesFromStorage() {
    try {
        const rawData = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (!rawData) return [];
        const parsed = JSON.parse(rawData);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) { return []; }
}

function applyTheme(themeName) {
    const themeIcon = themeToggleBtn?.querySelector('.theme-icon');
    const themeText = themeToggleBtn?.querySelector('.theme-text');

    if (themeName === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Світла тема';
    } else {
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Темна тема';
    }
}

function initTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyTheme(prefersDark ? 'dark' : 'light');
        }
    } catch (e) { applyTheme('dark'); }
}

themeToggleBtn?.addEventListener('click', () => {
    const isCurrentlyDark = document.body.classList.contains('dark-theme');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    applyTheme(newTheme);
    try { localStorage.setItem(THEME_STORAGE_KEY, newTheme); } catch (e) {}
});

function saveCartToStorage() {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch (error) {}
}

function updateCartSummary() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartCounter) cartCounter.textContent = totalItems;
    if (cartTotalSum) cartTotalSum.textContent = subtotalSum.toFixed(2);
    return subtotalSum;
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCartToStorage(); 
    updateCartSummary();
    if (cartOverlay && !cartOverlay.classList.contains("hidden")) {
        renderCartItems();
    }
}

function renderCartItems() {
    if (!cartItemsContainer) return;
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p class='empty-message'>Кошик порожній.</p>";
        if (cartTotalSum) cartTotalSum.textContent = "0";
        return;
    }
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
            <span class="cart-item-title" style="font-size: 14px; font-weight: bold; text-align: left; max-width: 70%;">${item.title}</span>
            <span class="cart-item-price" style="font-size: 14px; color: var(--text-muted); text-wrap: nowrap; margin-left: 10px;">
                $${item.price} x ${item.quantity}
            </span>
        </div>
    `).join("");
    updateCartSummary();
}

function saveFavoritesToStorage() {
    try { localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProductIds)); } catch (e) {}
}

function renderFavoritesZone() {
    if (!favoritesZone) return;
    if (favoriteProductIds.length === 0) {
        favoritesZone.innerHTML = '<p class="empty-fav">Перетягніть сюди товари в Улюблене</p>';
        return;
    }

    const favoriteItems = globalStoreProducts.filter(product => favoriteProductIds.includes(product.id));

    favoritesZone.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">Обрані товари (${favoriteProductIds.length}):</h4>
        <div class="fav-chips" style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 10px;">
            ${favoriteProductIds.map(id => {
                const item = favoriteItems.find(p => p.id === id);
                const displayTitle = item ? (item.title.length > 18 ? item.title.slice(0, 18) + "..." : item.title) : `Товар #${id}`;
                return `
                    <span class="fav-chip" style="background: var(--bg-primary); border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 20px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; color: var(--text-main); font-weight: bold;">
                        ❤️ ${displayTitle}
                        <button class="btn-remove-fav" data-id="${id}" style="border:none; background:none; cursor:pointer; color:red; font-weight:bold; margin-left:4px;">×</button>
                    </span>
                `;
            }).join('')}
        </div>
    `;
}

function initFormDraft() {
    if (!orderForm) return;
    try {
        const draftData = sessionStorage.getItem(FORM_STORAGE_KEY);
        if (draftData) {
            const parsedFields = JSON.parse(draftData);
            Object.keys(parsedFields).forEach(key => {
                const input = orderForm.elements[key];
                if (input) input.value = parsedFields[key];
            });
        }
    } catch (e) {}

    orderForm.addEventListener("input", () => {
        const formData = {
            clientName: orderForm.elements['clientName']?.value,
            clientPhone: orderForm.elements['clientPhone']?.value,
            clientEmail: orderForm.elements['clientEmail']?.value,
            orderPromo: orderForm.elements['orderPromo']?.value
        };
        try { sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData)); } catch (e) {}
    });
}

try {
    window.addEventListener('storage', (event) => {
        if (event.key === CART_STORAGE_KEY) {
            cart = loadCartFromStorage();
            updateCartSummary();
            if (cartOverlay && !cartOverlay.classList.contains("hidden")) renderCartItems();
        }
        if (event.key === THEME_STORAGE_KEY) {
            applyTheme(event.newValue || 'light');
        }
        if (event.key === FAVORITES_STORAGE_KEY) {
            favoriteProductIds = loadFavoritesFromStorage();
            renderFavoritesZone();
        }
    });
} catch (e) {}

function renderProducts(productsToDisplay) {
    if (!productsGrid) return;
    if (!productsToDisplay || productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p class="no-products" style="grid-column: 1/-1; text-align: center; color: #777; font-style: italic;">Товарів не знайдено</p>';
        return;
    }
    productsGrid.innerHTML = productsToDisplay.map(product => `
        <article class="product-card" draggable="true" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" draggable="false">
            <h3 title="${product.title}">${product.title}</h3>
            <p class="price">$${product.price}</p>
            <button class="btn-buy" data-id="${product.id}">Купити</button>
        </article>
    `).join("");
}

function initShop() {
}