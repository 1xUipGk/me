<?php
// تشفير المتغيرات الحساسة
define('IMGUR_CLIENT_ID', base64_encode('25775838e772fa2'));
define('FIREBASE_CONFIG', json_encode([
    'apiKey' => base64_encode('your-api-key'),
    'authDomain' => base64_encode('your-auth-domain'),
    'projectId' => base64_encode('your-project-id'),
    'storageBucket' => base64_encode('your-storage-bucket'),
    'messagingSenderId' => base64_encode('your-messaging-sender-id'),
    'appId' => base64_encode('your-app-id'),
    'databaseURL' => base64_encode('your-database-url')
])); 