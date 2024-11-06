<?php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// التحقق من مصدر الطلب
$allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowedOrigins)) {
    http_response_code(403);
    die(json_encode(['error' => 'Forbidden']));
}

header('Access-Control-Allow-Origin: ' . $origin);

// التحقق من طريقة الطلب
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(['error' => 'Method Not Allowed']));
}

require_once '../config.php';

// إرجاع البيانات المشفرة
echo FIREBASE_CONFIG; 