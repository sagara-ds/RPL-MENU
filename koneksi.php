<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

mysqli_report(MYSQLI_REPORT_OFF);

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'db_rpl';
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
            $conn->query("INSERT INTO menu (name, price, img, stock) VALUES
                ('Nasi Goreng', 15000, 'assets/image/RPL_LOGO2.png', 10),
                ('Mie Ayam', 12000, 'assets/image/RPL_LOGO2.png', 8),
                ('Es Teh', 5000, 'assets/image/RPL_LOGO2.png', 20)");
        }
    }
} catch (Exception $e) {
    $db_error = $e->getMessage();
    $conn = null;
}
?>