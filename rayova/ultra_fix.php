<?php
/**
 * RAYOVA ULTRA-FIX SCRIPT v2 (CLI Stable)
 * Run this via: php rayova/ultra_fix.php
 */

// Force a remote address for CLI to avoid Symfony IpUtils errors
if (php_sapi_name() === 'cli') {
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
}

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

// Bootstrap the console kernel instead of handling a request
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

echo "--- STARTING RAYOVA SYSTEM FIX (CLI) ---\n";

try {
    // 1. Database Fix
    echo "Checking newsletter_subscribers table...\n";
    if (Schema::hasTable('newsletter_subscribers')) {
        if (!Schema::hasColumn('newsletter_subscribers', 'phone')) {
            echo "Adding 'phone' column...\n";
            Schema::table('newsletter_subscribers', function (Blueprint $table) {
                $table->string('phone')->nullable()->after('email');
            });
            echo "SUCCESS: 'phone' column added.\n";
        } else {
            echo "INFO: 'phone' column already exists.\n";
        }
    } else {
        echo "ERROR: Table newsletter_subscribers not found!\n";
    }

    // 2. Cache Fix
    echo "\nClearing all Laravel caches...\n";
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    echo "SUCCESS: Caches cleared.\n";

    // 3. Verification
    echo "\nVerifying table structure:\n";
    $columns = Schema::getColumnListing('newsletter_subscribers');
    echo "Current columns: " . implode(', ', $columns) . "\n";

} catch (\Exception $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
}

echo "\n--- FIX COMPLETED ---\n";
