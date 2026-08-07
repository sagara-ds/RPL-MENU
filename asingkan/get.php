<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === 'http://localhost:3002' || $origin === 'http://127.0.0.1:3002') {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/koneksi.php';

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Koneksi database gagal',
        'detail' => $db_error ?? 'Pastikan MySQL di Laragon aktif dan kredensial database benar.'
    ]);
    exit;
}

$sql = 'SELECT id, name, price, img, stock FROM menu ORDER BY id';
$result = $conn->query($sql);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Query gagal', 'detail' => $conn->error]);
    $conn->close();
    exit;
}

$menuData = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['price'] = (int)$row['price'];
    $row['stock'] = (int)$row['stock'];
    $menuData[] = $row;
}

$conn->close();
echo json_encode($menuData, JSON_PRETTY_PRINT);
?>