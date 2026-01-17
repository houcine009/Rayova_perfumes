<?php
$host = '127.0.0.1';
$db   = 'rayova';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_TIMEOUT            => 5,
];

try {
     echo "Attempting connection to $host...\n";
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "CONNECTED SUCCESSFULLY\n";
     $stmt = $pdo->query('SHOW TABLES');
     while ($row = $stmt->fetch()) {
         print_r($row);
     }
} catch (\PDOException $e) {
     echo "CONNECTION FAILED: " . $e->getMessage() . "\n";
}
