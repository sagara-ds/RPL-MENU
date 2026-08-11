// ============ SUPABASE CONFIG ============
const SUPABASE_URL = 'https://vrexdlklxjifxnmtyphs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZXhkbGtseGppZnhubXR5cGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzY3NDAsImV4cCI6MjEwMTY1Mjc0MH0.Rc6KMW-JvL-C9QlYYbltL_NGKCYlYgQC75knOF6O_Pw';

// Supabase client for realtime
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============ DOM ELEMENTS ============
const cartToggleBtn = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cartPanel");
const cartItemsContainer = document.querySelector("#cart-items");
const cartCloseBtn = document.querySelector(".cart-close");
const resetCartBtn = document.querySelector("#reset-cart-btn");
const checkoutBtn = document.querySelector('.checkout-btn');
const modalOverlay = document.querySelector('#checkout-modal');
const btnBatal = document.querySelector('#btn-batal');
const formCheckout = document.querySelector('#checkout-form');
const cartTotal = document.querySelector(".cart-total");
const menuContainer = document.getElementById("menu-container");

let cart = [];
let menuData = [];

// ============ FETCH MENU FROM SUPABASE ============
async function loadMenu() {
    const url = `${SUPABASE_URL}/rest/v1/menu?select=*&order=id.asc`;

    try {
        if (menuContainer && menuData.length === 0) {
            menuContainer.innerHTML = '<p class="loading-text">⏳ Memuat menu...</p>';
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'authorization': `Bearer ${SUPABASE_KEY}`,
                'content-type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Data menu tidak valid');
        }

        menuData = data;
        renderMenu();
    } catch (error) {
        console.error('Fetch Error:', error);
        if (menuContainer) {
            menuContainer.innerHTML = `<p class="error-text">❌ Gagal memuat menu.<br>${error.message}</p>`;
        }
    }
}

// ============ IMAGE MAPPING ============
// Supabase img field = "assets/image/katsu.jpg" → local = "image/product/katsu.jpg"
function getLocalImage(supabaseImg) {
    if (!supabaseImg) return 'image/RPL_LOGO2.png';
    const filename = supabaseImg.split('/').pop();
    return `image/product_D3/${filename}`;
}

// ============ RENDER MENU ============
function renderMenu() {
    if (!menuContainer) return;

    if (menuData.length === 0) {
        menuContainer.innerHTML = '<p class="loading-text">Tidak ada menu tersedia.</p>';
        return;
    }

    menuContainer.innerHTML = menuData.map(menu => `
        <div class="menu-card ${menu.stock <= 0 ? 'out-of-stock' : ''}" data-id="${menu.id}">
            <img src="${getLocalImage(menu.img)}" alt="${menu.name}" onerror="this.src='image/RPL_LOGO2.png'">
            <h3 class="menu-card-title">${menu.name}</h3>
            <p class="stock-label ${menu.stock <= 0 ? 'stock-empty' : menu.stock <= 3 ? 'stock-low' : ''}">
            Stok: ${menu.stock <= 0 ? 'SOLD-OUT!' : menu.stock}
            </p>
            <p>Harga: IDR ${menu.price.toLocaleString('id-ID')}</p>
            <button class="menu-add-btn" ${menu.stock <= 0 ? 'disabled' : ''}>
                ${menu.stock <= 0 ? '✕' : 'Tambah'}
            </button>
        </div>
    `).join('');

    attachAddButtons();
}

// ============ ADD TO CART ============
function attachAddButtons() {
    if (!menuContainer) return;
    menuContainer.querySelectorAll('.menu-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            if (!card) return;

            const id = parseInt(card.dataset.id);
            const menuItem = menuData.find(m => m.id === id);
            if (!menuItem || menuItem.stock <= 0) return;

            const existingItem = cart.find(i => i.id === id);
            if (existingItem) {
                if (existingItem.quantity >= menuItem.stock) {
                    showToast(`Stok ${menuItem.name} hanya tersisa ${menuItem.stock}!`, 'warning');
                    return;
                }
                existingItem.quantity++;
            } else {
                cart.push({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    stock: menuItem.stock,
                    quantity: 1
                });
            }

            // Animasi button saat ditambah
            btn.classList.add('btn-added');
            btn.textContent = '✓ Ditambah';
            setTimeout(() => {
                btn.classList.remove('btn-added');
                btn.textContent = 'Tambah';
            }, 600);

            renderCart();
            cartPanel.classList.add('show');
        });
    });
}

// ============ TOAST NOTIFICATION ============
function showToast(message, type = 'info') {
    // Hapus toast lama jika ada
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animasi masuk
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ CART TOGGLE ============
if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', () => cartPanel.classList.toggle('show'));
}
if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => cartPanel.classList.remove('show'));
}

// ============ RENDER CART ============
function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Belum ada item di keranjang.</p>';
        if (cartTotal) cartTotal.textContent = 'Total: IDR 0';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <span class="cart-item-name">${item.name} (x${item.quantity})</span>
                <div class="cart-subtotal">IDR ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
            </div>
            <div class="cart-controls">
                <button onclick="updateQty(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQty(${item.id}, 1)">+</button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = `Total: IDR ${total.toLocaleString('id-ID')}`;
}

// ============ UPDATE QUANTITY ============
window.updateQty = function(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (change > 0) {
        const menuItem = menuData.find(m => m.id === id);
        if (menuItem && item.quantity >= menuItem.stock) {
            showToast(`Stok ${item.name} hanya tersisa ${menuItem.stock}!`, 'warning');
            return;
        }
    }

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    renderCart();
};

// ============ RESET CART ============
if (resetCartBtn) {
    resetCartBtn.addEventListener('click', () => {
        cart.length = 0;
        renderCart();
    });
}

// ============ CHECKOUT ============
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Keranjang masih kosong, pilih menu dulu!', 'warning');
            return;
        }
        modalOverlay.classList.add('show');
        cartPanel.classList.remove('show');
    });
}

if (btnBatal) {
    btnBatal.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
    });
}

if (formCheckout) {
    formCheckout.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nomorAdminWA = "6285624273949";
        const nama = document.querySelector('#nama').value;
        const alamat = document.querySelector('#alamat').value;
        const catatan = document.querySelector('#catatan').value;
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const btnKonfirmasi = document.querySelector('#btn-konfirmasi');
        if (btnKonfirmasi) {
            btnKonfirmasi.textContent = 'Memproses...';
            btnKonfirmasi.disabled = true;
        }

        try {
            for (const item of cart) {
                const menuItem = menuData.find(m => m.id === item.id);
                if (!menuItem) continue;

                if (menuItem.stock < item.quantity) {
                    showToast(`Stok ${item.name} tidak cukup! Tersisa ${menuItem.stock}.`, 'warning');
                    await loadMenu();
                    return;
                }
            }

            // Build pesan WhatsApp
            let daftarPesanan = "";
            cart.forEach(item => {
                daftarPesanan += `%0A- *${item.name}* (x${item.quantity}) : IDR ${(item.price * item.quantity).toLocaleString('id-ID')}`;
            });

            const pesanWA = `Halo Admin RPL Online Orders, saya mau pesan!%0A%0A` +
                `*--- DATA PEMESAN ---*%0A` +
                `*Nama:* ${nama}%0A` +
                `*Alamat:* ${alamat}%0A` +
                `*Catatan:* ${catatan ? catatan : '-'}%0A%0A` +
                `*--- DETAIL PESANAN ---*` +
                `${daftarPesanan}%0A%0A` +
                `*TOTAL BAYAR: IDR ${total.toLocaleString('id-ID')}*%0A%0A` +
                `Mohon segera diproses ya, terima kasih!`;

            window.open(`https://wa.me/${nomorAdminWA}?text=${pesanWA}`, '_blank');

            showToast(`Pesanan berhasil! Total: IDR ${total.toLocaleString('id-ID')}`, 'success');

            formCheckout.reset();
            modalOverlay.classList.remove('show');
            cart.length = 0;
            renderCart();
            await loadMenu(); // Refresh stok dari Supabase
        } catch (error) {
            console.error('Error checkout:', error);
            showToast('Terjadi kesalahan saat checkout. Coba lagi.', 'warning');
        } finally {
            if (btnKonfirmasi) {
                btnKonfirmasi.textContent = 'Chat WA';
                btnKonfirmasi.disabled = false;
            }
        }
    });
}

function subscribeToStockChanges() {
    supabaseClient
        .channel('online-menu-stock')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'menu'
        }, (payload) => {
            console.log('Stok berubah:', payload);
            if (payload.new) {
                const index = menuData.findIndex(m => m.id === payload.new.id);
                if (index !== -1) {
                    const oldStock = menuData[index].stock;
                    menuData[index] = payload.new;
                    renderMenu();


                    cart.forEach(cartItem => {
                        if (cartItem.id === payload.new.id) {
                            cartItem.stock = payload.new.stock;
                            if (cartItem.quantity > payload.new.stock) {
                                cartItem.quantity = Math.max(0, payload.new.stock);
                            }
                        }
                    });
                    cart = cart.filter(i => i.quantity > 0);
                    renderCart();

                    // Notif 
                    if (payload.new.stock <= 0 && oldStock > 0) {
                        showToast(`${payload.new.name} baru saja habis!`, 'warning');
                    }
                    const card = menuContainer.querySelector(`[data-id="${payload.new.id}"]`);
                    if (card) {
                        card.classList.add('stock-pulse');
                        setTimeout(() => card.classList.remove('stock-pulse'), 1000);
                    }
                }
            }
        })
        .subscribe();
}


loadMenu();
subscribeToStockChanges();
