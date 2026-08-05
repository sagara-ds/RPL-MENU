const navbarNav = document.querySelector('.navbar-nav');
const hamburger = document.querySelector('#hamburger-menu');
const cartToggle = document.querySelector('.cart-toggle');
const cartPanel = document.querySelector('#cartPanel');
const cartClose = document.querySelector('.cart-close');
const cartContainer = document.querySelector('.cart-container');

// Toggle menu hamburger
hamburger.onclick = (e) => {
    navbarNav.classList.toggle('active');
    e.preventDefault();
};

// klik di luar langsung nutup
document.addEventListener('click', function (e) {
    if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
        navbarNav.classList.remove('active');
    }
});

// opsional we ey
const navLinks = document.querySelectorAll('.navbar-nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbarNav.classList.remove('active');
    });
});

// keranjang kosong
const cart = [];

// elemen render cart
const cartList = document.querySelector('#cart-items');
const cartTotal = document.querySelector('.cart-total');

const menuData = [
    { id: 1, name: 'Menu 1', price: 25000, img: 'assets/image/RPL_LOGO.png', stock: 10 },
    { id: 2, name: 'Menu 2', price: 18000, img: 'assets/image/RPL_LOGO.png', stock: 15 },
    { id: 3, name: 'Menu 3', price: 30000, img: 'assets/image/RPL_LOGO.png', stock: 5 },
    { id: 4, name: 'Menu 4', price: 22000, img: 'assets/image/RPL_LOGO.png', stock: 8 },
    { id: 5, name: 'Menu 5', price: 27000, img: 'assets/image/RPL_LOGO.png', stock: 12 }
];

const menuContainer = document.getElementById('menu-container');

function renderMenu() {
    if (!menuContainer) return;

    menuContainer.innerHTML = menuData.map(menu => `
        <div class="menu-card" data-id="${menu.id}" data-name="${menu.name}" data-price="${menu.price}">
            <h3 class="menu-card-title">${menu.name}</h3>
            <img src="${menu.img}" alt="${menu.name}" class="menu-card-img">
            <p class="price">IDR. ${menu.price.toLocaleString('id-ID')}</p>
            <button class="menu-add-btn" type="button">Tambah</button>
            <p class="stock">STOK: <span class="stock-count">${menu.stock}</span></p>
        </div>
    `).join('');

    attachAddButtons();
}

function attachAddButtons() {
    menuContainer.querySelectorAll('.menu-add-btn').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.menu-card');
            if (!card) return;

            const item = {
                id: card.dataset.id,
                name: card.dataset.name || card.querySelector('.menu-card-title')?.textContent.trim(),
                price: Number(card.dataset.price) || 0,
                quantity: 1
            };

            addToCart(item);
            
            if (cartPanel) cartPanel.classList.add('show');
        });
    });
}

function addToCart(item) {
    const existing = cart.find(product => product.id === item.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item });
    }

    renderCart();
}

function changeQuantity(id, delta) {
    const item = cart.find(product => product.id === id);
    if (!item) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        const index = cart.indexOf(item);
        cart.splice(index, 1);
    }

    renderCart();
}

function renderCart() {
    if (!cartList) return;

    if (cart.length === 0) {
        cartList.innerHTML = '<p class="cart-empty">Belum ada item di keranjang.</p>';
        cartTotal.textContent = 'Total: IDR 0';
        return;
    }

    cartList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-subtotal">IDR ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
            </div>
            <div class="cart-controls">
                <button type="button" data-action="decrease" data-id="${item.id}">-</button>
                <span class="cart-quantity">${item.quantity}</span>
                <button type="button" data-action="increase" data-id="${item.id}">+</button>
            </div>
        </div>
    `).join('');

    cartList.querySelectorAll('button[data-action]').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const action = button.dataset.action;
            changeQuantity(id, action === 'increase' ? 1 : -1);
        });
    });

    updateTotal();
}

function updateTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartTotal) {
        cartTotal.textContent = `Total: IDR ${total.toLocaleString('id-ID')}`;
    }
}

function toggleCart() {
    if (!cartPanel) return;
    cartPanel.classList.toggle('show');
}

function closeCart() {
    if (!cartPanel) return;
    cartPanel.classList.remove('show');
}

cartToggle?.addEventListener('click', toggleCart);
cartClose?.addEventListener('click', closeCart);

const resetBtn = document.querySelector('#reset-cart-btn');

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang sudah kosong.');
            return;
        }
        const konfirmasi = confirm('Yakin?');
        if (konfirmasi) {
            cart.length = 0; // ngosongin array
            renderCart();
        }
    });
}
renderMenu();
renderCart(); 
