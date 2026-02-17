<?php
// rayova/public/force_schema.php

define('LARAVEL_START', microtime(true));
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "<h1>Rayova Schema Enforcer</h1>";

try {
    echo "<p>Upgrading Product Media...</p>";
    // Use LONGBLOB for maximum capacity (4GB) and binary safety
    DB::statement('ALTER TABLE product_media MODIFY file_data LONGBLOB');
    DB::statement('ALTER TABLE product_media MODIFY url LONGTEXT');
    echo "<strong style='color:green'>SUCCESS: product_media fixed.</strong><br>";

    echo "<p>Upgrading Categories...</p>";
    DB::statement('ALTER TABLE categories MODIFY file_data LONGBLOB');
    DB::statement('ALTER TABLE categories MODIFY image_url LONGTEXT');
    echo "<strong style='color:green'>SUCCESS: categories fixed.</strong><br>";

} catch (\Exception $e) {
    echo "<h2 style='color:red'>ERROR: " . $e->getMessage() . "</h2>";
}
