<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

mysqli_report(MYSQLI_REPORT_OFF);

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'rpl-menu';
$port = 3306;

$conn = null;
$db_error = null;

try {
    if (!extension_loaded('mysqli')) {
        throw new Exception('Ekstensi mysqli belum aktif di PHP.');
    }

    $conn = new mysqli($host, $user, $pass, '', $port);
    if ($conn->connect_error) {
        throw new Exception($conn->connect_error);
    }

    $conn->set_charset('utf8mb4');

    $conn->query("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    if (!$conn->select_db($db)) {
        throw new Exception('Gagal memilih database: ' . $conn->error);
    }

    $conn->query("CREATE TABLE IF NOT EXISTS menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price INT NOT NULL DEFAULT 0,
        img VARCHAR(255) DEFAULT '',
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $check = $conn->query("SELECT COUNT(*) AS total FROM menu");
    if ($check) {
        $row = $check->fetch_assoc();
        if ((int)$row['total'] === 0) {
            $conn->query("INSERT INTO menu (id, name, price, img, stock) VALUES
(1, 'Chicken Katsu', 15000, 'assets/image/product/katsu.jpg', 10),
(2, 'Ketan Susu', 10000, 'assets/image/product/ketan susu.jpg', 15),
(3, 'Kopi Gula Aren', 10000, 'assets/image/product/kopi gula aren.jpg', 5),
(4, 'Lumpia Ubi', 6000, 'assets/image/product/lumpia ubi.jpg', 8),
(5, 'Ayam Pop Matah', 15000, 'assets/image/product/pop matah.jpg', 12),
(6, 'Risol', 3000, 'assets/image/product/risol.jpeg', 12),
(7, 'Wonton', 27000, 'assets/image/product/wonton.jpg', 12),
(8, 'Stup Roti', 27000, 'assets/image/product/setup roti.jpg', 12),
(9, 'Makroni', 27000, 'assets/image/product/makroni.jpg', 12),
(10, 'Ayam Suir', 27000, 'assets/image/product/ayam suir.jpg', 12),
(11, 'Risol Mayo', 27000, 'assets/image/product/mayo.jpeg', 12);");
        }
    }
} catch (Exception $e) {
    $db_error = $e->getMessage();
    $conn = null;
}
?>