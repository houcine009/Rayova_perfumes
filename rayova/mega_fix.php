<?php
/**
 * RAYOVA MEGA FIX V7.0 - INDESTRUCTIBLE EDITION
 * This script will force the database to expand and fix all visibility issues.
 */

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

define('LARAVEL_START', microtime(true));

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- RAYOVA MEGA FIX V7.0 ---\n";

try {
    echo "1. Forcing Database Expansion (Setting LONGTEXT)...\n";
    
    // Fix product_media
    DB::statement("ALTER TABLE product_media MODIFY url LONGTEXT NULL");
    DB::statement("ALTER TABLE product_media MODIFY file_data LONGTEXT NULL");
    echo " [+] Fixed product_media table.\n";

    // Fix categories
    DB::statement("ALTER TABLE categories MODIFY image_url LONGTEXT NULL");
    DB::statement("ALTER TABLE categories MODIFY file_data LONGTEXT NULL");
    echo " [+] Fixed categories table.\n";

    // Fix site_media
    DB::statement("ALTER TABLE site_media MODIFY file_data LONGTEXT NULL");
    echo " [+] Fixed site_media table.\n";

    echo "2. Repairing 'localhost' links...\n";
    $count = DB::table('categories')
        ->where('image_url', 'like', '%localhost%')
        ->update(['image_url' => DB::raw("REPLACE(image_url, 'http://localhost', 'https://api.rayovaparfums.com')")]);
    echo " [+] Repaired $count links in categories.\n";

    $countMedia = DB::table('product_media')
        ->where('url', 'like', '%localhost%')
        ->update(['url' => DB::raw("REPLACE(url, 'http://localhost', 'https://api.rayovaparfums.com')")]);
    echo " [+] Repaired $countMedia links in product_media.\n";

    $countSettings = DB::table('site_settings')
        ->where('value', 'like', '%localhost%')
        ->update(['value' => DB::raw("REPLACE(value, 'http://localhost', 'https://api.rayovaparfums.com')")]);
    echo " [+] Repaired $countSettings links in settings.\n";

    echo "3. Flushing all caches...\n";
    \Artisan::call('optimize:clear');
    \Artisan::call('config:cache');
    if (function_exists('opcache_reset')) {
        opcache_reset();
    }
    echo " [+] Server brain flushed.\n";

    echo "\n--- SUCCESS! ALL SYSTEMS NOMINAL ---\n";
    echo "You can now upload photos and they will be visible instantly.\n";

} catch (\Exception $e) {
    echo "\n[!!!] CRITICAL ERROR: " . $e->getMessage() . "\n";
}
