<?php
// rayova/public/db_check.php

// Load Laravel's autoloader to get env helper if needed, 
// OR just read .env manually if we want to be raw.
// Let's try to boot the kernel minimally to get config.

define('LARAVEL_START', microtime(true));

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "<h1>Rayova Database Diagnostic</h1>";

try {
    $dbName = config('database.connections.mysql.database');
    $dbHost = config('database.connections.mysql.host');
    echo "<p><strong>Target Database:</strong> $dbName @ $dbHost</p>";

    // Test Connection
    \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "<h2 style='color:green'>✅ SUCCESS: Connected to Database!</h2>";
    
    // Test Table Existence
    $userCount = \Illuminate\Support\Facades\DB::table('users')->count();
    echo "<p><strong>Users Table:</strong> Found $userCount users.</p>";
    
} catch (\Exception $e) {
    echo "<h2 style='color:red'>❌ FAILURE: Could not connect!</h2>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
}
