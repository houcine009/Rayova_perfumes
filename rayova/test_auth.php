<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Auth;

$email = 'houcinezaghmane@gmail.com';
$password = 'wrong_password';

$attempt = Auth::attempt(['email' => $email, 'password' => $password]);

if ($attempt) {
    echo "Bypass detected! Logged in with wrong password.\n";
} else {
    echo "No bypass detected. Login failed as expected.\n";
}

$password = 'Houcine33@';
$attempt = Auth::attempt(['email' => $email, 'password' => $password]);

if ($attempt) {
    echo "Login successful with correct password.\n";
} else {
    echo "Login failed even with correct password.\n";
}
