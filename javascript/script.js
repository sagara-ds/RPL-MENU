const cartToggleBtn = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cartPanel");
const cartItemsContainer = document.querySelector("#cart-items")
const cartCloseBtn = document.querySelector(".cart-close");
const cartContainer = document.querySelector(".cart-container");
const resetCartBtn = document.querySelector("#reset-cart-btn");

let cart = [];
const cartList = document.querySelector("#cart-items");
const cartTotal = document.querySelector(".cart-total");

if (cartToggleBtn) {
    cartToggleBtn.addEventListener('click', () => cartPanel.classList.toggle('show'))
}
if (cartCloseBtn) {
    cartCloseBtn.addEventListener('click', () => cartPanel.classList.remove('show'))
}

function renderCart() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="cart-empty">Belum ada item di keranjang.</p>';
        if (cartTotal) cartTotal.textContent = 'Total: IDR 0';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span class="cart-item-name">${item.name} (x${item.quantity})</span>
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

window.updateQty = function(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    renderCart();
};

function attachAddButtons() {
    const addButtons = document.querySelectorAll('.menu-add-btn');
    addButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            const id = index; 
            const name = card.querySelector('.menu-card-title').innerText;
            const priceText = card.querySelector('p').innerText;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));

            const existingItem = cart.find(i => i.id === id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            renderCart();
            cartPanel.classList.add('show');
        });
    });
}
attachAddButtons();
if (resetCartBtn) {
    resetCartBtn.addEventListener('click', () => {
        cart.length = 0;
        renderCart();
    });
}


const checkoutBtn = document.querySelector('.checkout-btn');
const modalOverlay = document.querySelector('#checkout-modal');
const btnBatal = document.querySelector('#btn-batal');
const formCheckout = document.querySelector('#checkout-form');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Keranjang masih kosong, pilih menu dulu!');
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
    formCheckout.addEventListener('submit', (e) => {
        e.preventDefault();


        const nomorAdminWA = "6287846895031"; 

        const nama = document.querySelector('#nama').value;
        const alamat = document.querySelector('#alamat').value;
        const catatan = document.querySelector('#catatan').value;
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

        formCheckout.reset();
        modalOverlay.classList.remove('show');
        renderCart();
    });
}

