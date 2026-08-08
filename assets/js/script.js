const navbarNav = document.querySelector(".navbar-nav");
const hamburger = document.querySelector("#hamburger-menu");
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector("#cartPanel");
const cartClose = document.querySelector(".cart-close");
const cartContainer = document.querySelector(".cart-container");
const checkoutBtn = document.querySelector(".checkout-btn");
const modalOverlay = document.querySelector("#checkout-modal");
const btnBatal = document.querySelector("#btn-batal");
const formCheckout = document.querySelector("#checkout-form");

// Toggle menu hamburger
hamburger.onclick = (e) => {
  navbarNav.classList.toggle("active");
  e.preventDefault();
};

// klik di luar langsung nutup
document.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

// opsional we ey
const navLinks = document.querySelectorAll(".navbar-nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navbarNav.classList.remove("active");
  });
});

// keranjang kosong
const cart = [];

// elemen render cart
const cartList = document.querySelector("#cart-items");
const cartTotal = document.querySelector(".cart-total");

let menuData = [];

async function loadMenu() {
  const url = "https://vrexdlklxjifxnmtyphs.supabase.co/rest/v1/menu?select=*";

  try {
    const response = await fetch(url, { method: "GET",
    headers: {
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZXhkbGtseGppZnhubXR5cGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzY3NDAsImV4cCI6MjEwMTY1Mjc0MH0.Rc6KMW-JvL-C9QlYYbltL_NGKCYlYgQC75knOF6O_Pw",
      "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZXhkbGtseGppZnhubXR5cGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNzY3NDAsImV4cCI6MjEwMTY1Mjc0MH0.Rc6KMW-JvL-C9QlYYbltL_NGKCYlYgQC75knOF6O_Pw",
      "content-type": "application/json",
    },
    cache: "no-store" });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`Server mengembalikan status ${response.status}`);
    }

    const trimmed = text.trim();
    if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
      if (trimmed.includes("<?php") || trimmed.includes("<!DOCTYPE")) {
        throw new Error(
          "PHP belum dieksekusi. Buka project lewat Laragon/localhost, bukan file langsung dari folder.",
        );
      }
      throw new Error(trimmed || "Respons server bukan JSON");
    }

    const data = JSON.parse(trimmed);
    if (!Array.isArray(data)) {
      throw new Error(data.error || "Data menu tidak valid");
    }

    menuData = data;
    renderMenu(menuData);
  } catch (error) {
    console.error("Fetch Error:", error);
    const container = document.getElementById("menu-container");
    if (container) {
      container.innerHTML = `Gagal memuat menu dari database.<br>${error.message}`;
    }
  }
}

loadMenu();

const menuContainer = document.getElementById("menu-container");

function renderMenu(data = menuData) {
  if (!menuContainer) return;

  menuContainer.innerHTML = data
    .map(
      (menu) => `
        <div class="menu-card" data-id="${menu.id}" data-name="${menu.name}" data-price="${menu.price}">
            <h3 class="menu-card-title">${menu.name}</h3>
            <img src="${menu.img || "assets/image/RPL_LOGO2.png"}" alt="${menu.name}" class="menu-card-img">
            <p class="price">IDR. ${menu.price.toLocaleString("id-ID")}</p>
            <p class="stock">STOK: <span class="stock-count">${menu.stock}</span></p>
            <button class="menu-add-btn" type="button">Tambah</button>
        </div>
    `,
    )
    .join("");

  attachAddButtons();
}

function attachAddButtons() {
  menuContainer.querySelectorAll(".menu-add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".menu-card");
      if (!card) return;

      const item = {
        id: card.dataset.id,
        name:
          card.dataset.name ||
          card.querySelector(".menu-card-title")?.textContent.trim(),
        price: Number(card.dataset.price) || 0,
        quantity: 1,
      };

      addToCart(item);

      if (cartPanel) cartPanel.classList.add("show");
    });
  });
}

function addToCart(item) {
  const existing = cart.find((product) => product.id === item.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item });
  }

  renderCart();
}

function changeQuantity(id, delta) {
  const item = cart.find((product) => product.id === id);
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
    cartList.innerHTML =
      '<p class="cart-empty">Belum ada item di keranjang.</p>';
    cartTotal.textContent = "Total: IDR 0";
    return;
  }

  cartList.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <div>
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-subtotal">IDR ${(item.price * item.quantity).toLocaleString("id-ID")}</div>
            </div>
            <div class="cart-controls">
                <button type="button" data-action="decrease" data-id="${item.id}">-</button>
                <span class="cart-quantity">${item.quantity}</span>
                <button type="button" data-action="increase" data-id="${item.id}">+</button>
            </div>
        </div>
    `,
    )
    .join("");

  cartList.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const action = button.dataset.action;
      changeQuantity(id, action === "increase" ? 1 : -1);
    });
  });

  updateTotal();
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (cartTotal) {
    cartTotal.textContent = `Total: IDR ${total.toLocaleString("id-ID")}`;
  }
}

function buildReceiptHtml(customer, items, total) {
  const rows = items
    .map(
      (item) => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}x</td>
            <td>Rp ${(item.price * item.quantity).toLocaleString("id-ID")}</td>
        </tr>
    `,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Struk RPL.menu</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; background: #f5f5f5; }
    .container { display: flex; flex-direction: column; gap: 12px; }
    .box { max-width: 420px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 12px; background: white; }
    h2 { text-align: center; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 8px 0; border-bottom: 1px dashed #ccc; text-align: left; }
    .total { font-weight: bold; font-size: 16px; margin-top: 12px; }
    .print-btn { display: block; margin: 20px auto; padding: 12px 32px; background: #0064D4; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
    .print-btn:hover { background: #0053b0; }
    @media print {
      .print-btn { display: none; }
      body { background: white; padding: 0; }
      .box { border: none; box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">
      <h2>RPL.menu</h2>
      <p style="text-align:center; margin:0 0 12px;">Struk Pembayaran</p>
      <div><strong>Nama:</strong> ${customer.nama}</div>
      <div><strong>Alamat:</strong> ${customer.alamat}</div>
      <div><strong>Catatan:</strong> ${customer.catatan || "-"}</div>
      <table>
        <thead>
          <tr><th>Menu</th><th>Qty</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total: Rp ${total.toLocaleString("id-ID")}</div>
    </div>
    <button class="print-btn" onclick="window.print()">🖨 Cetak Struk</button>
  </div>
</body>
</html>`;
}

function openReceiptWindow(html) {
  const newWindow = window.open("", "_blank", "width=420,height=700");
  if (!newWindow) {
    alert("Popup diblokir browser. Izinkan popup untuk melihat struk.");
    return false;
  }

  newWindow.document.write(html);
  newWindow.document.close();
  return true;
}

function toggleCart() {
  if (!cartPanel) return;
  cartPanel.classList.toggle("show");
}

function closeCart() {
  if (!cartPanel) return;
  cartPanel.classList.remove("show");
}

cartToggle?.addEventListener("click", toggleCart);
cartClose?.addEventListener("click", closeCart);

const resetBtn = document.querySelector("#reset-cart-btn");
const printReceiptBtn = document.querySelector("#print-receipt-btn");
let lastReceiptUrl = "";

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Keranjang sudah kosong.");
      return;
    }
    const konfirmasi = confirm("Yakin?");
    if (konfirmasi) {
      cart.length = 0;
      renderCart();
      if (printReceiptBtn) printReceiptBtn.hidden = true;
    }
  });
}
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong, pilih menu terlebih dahulu!");
      return;
    }
    modalOverlay.classList.add("show");
    document.querySelector("#cartPanel").classList.remove("show");
  });
}

if (btnBatal) {
  btnBatal.addEventListener("click", () => {
    modalOverlay.classList.remove("show");
  });
}

if (formCheckout) {
  formCheckout.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama = document.querySelector("#nama").value;
    const alamat = document.querySelector("#alamat").value;
    const catatan = document.querySelector("#catatan").value;
    const total = document.querySelector(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    import logoImage from './assets/image/Link-QR.png';
    const IMAFE_QR = logoImage;
    fetch("http://127.0.0.1:8000/api/receipt", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    qrImage: IMAGE_QR 
  })
});

    try {
      const response = await fetch("http://127.0.0.1:8000/api/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { nama, alamat, catatan },
          items: cart,
          total,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok) {
          lastReceiptUrl = result.receiptUrl;
          if (printReceiptBtn) {
            printReceiptBtn.hidden = false;
            printReceiptBtn.onclick = () => {
              window.open(lastReceiptUrl, "_blank");
            };
          }
        }
      } else {
        throw new Error("server tidak merespons");
      }
    } catch (error) {
      console.error("Gagal membuat struk dari server:", error);
      const html = buildReceiptHtml(
        { nama, alamat, catatan },
        cart,
        total,
      );
      openReceiptWindow(html);
      if (printReceiptBtn) {
        printReceiptBtn.hidden = false;
        printReceiptBtn.onclick = () => {
          const receiptWindow = window.open(
            "",
            "_blank",
            "width=420,height=700",
          );
          if (receiptWindow) {
            receiptWindow.document.write(html);
            receiptWindow.document.close();
          }
        };
      }
    }

    alert(
      `Mantap ${nama}! Pesananmu senilai Rp ${total.toLocaleString("id-ID")} berhasil dibuat!`,
    );

    formCheckout.reset();
    modalOverlay.classList.remove("show");
    cart.length = 0;
    renderCart();
  });
}
renderMenu();
renderCart();
