document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('orders-panel');
    const closeBtn = document.querySelector('.orders-close');
    const itemsContainer = document.getElementById('orders-items');
    const emptyMessage = document.querySelector('.orders-empty');

    // 1. Fungsi untuk MENUTUP panel
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
    });

    // 2. Fungsi untuk MEMBUKA panel (Bisa dipanggil pada tombol lain)
    // Contoh pemanggilan: openPanel()
    window.openPanel = function() {
        panel.classList.add('open');
    };

    // 3. Fungsi untuk MENAMBAHKAN notifikasi baru secara dinamis
    // Contoh pemanggilan: addNotification("Pesanan #123 telah dikirim!")
    window.addNotification = function(message) {
        // Sembunyikan teks "Belum ada notifikasi"
        if (emptyMessage && emptyMessage.style.display !== 'none') {
            emptyMessage.style.display = 'none';
        }

        // Buat elemen div baru untuk notifikasi
        const notifElement = document.createElement('div');
        notifElement.className = 'notif-item';
        notifElement.textContent = message;

        // Masukkan elemen baru ke bagian paling atas daftar
        itemsContainer.prepend(notifElement);
    };

    // Contoh jika menggunakan Pusher
var pusher = new Pusher('APP_KEY_KAMU', { cluster: 'ap1' });
var channel = pusher.subscribe('order-channel');

channel.bind('order-baru', function(data) {
    // Fungsi ini otomatis berjalan sedetik setelah order masuk ke database
    addNotification("Pesanan #" + data.id_pesanan + " seharga Rp " + data.total);
});
});