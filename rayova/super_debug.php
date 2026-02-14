<?php
/**
 * RAYOVA SUPER DEBUG SCRIPT
 * Run via: php rayova/super_debug.php
 */

if (php_sapi_name() === 'cli') {
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
}

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\NewsletterSubscriber;
use App\Models\SiteSetting;

echo "=== RAYOVA SUPER DEBUG ===\n\n";

// 1. Check Table Structure
echo "[1] Database Schema Check:\n";
if (Schema::hasTable('newsletter_subscribers')) {
    $columns = Schema::getColumnListing('newsletter_subscribers');
    echo "- Table 'newsletter_subscribers' exists.\n";
    echo "- Columns: " . implode(', ', $columns) . "\n";
    if (in_array('phone', $columns)) {
        echo "  SUCCESS: 'phone' column found.\n";
    } else {
        echo "  CRITICAL: 'phone' column MISSING!\n";
    }
} else {
    echo "  CRITICAL: Table 'newsletter_subscribers' MISSING!\n";
}

// 2. Check Model Fillable
echo "\n[2] Model Check:\n";
$model = new NewsletterSubscriber();
echo "- Model Fillable: " . implode(', ', $model->getFillable()) . "\n";
if (in_array('phone', $model->getFillable())) {
    echo "  SUCCESS: 'phone' is fillable.\n";
} else {
    echo "  CRITICAL: 'phone' is NOT in fillable list!\n";
}

// 3. Check Data
echo "\n[3] Newsletter Data Sample (Last 3):\n";
$subs = NewsletterSubscriber::orderBy('created_at', 'desc')->limit(3)->get();
if ($subs->count() > 0) {
    foreach ($subs as $s) {
        echo "- Email: {$s->email}, Phone: " . ($s->phone ?? "[NULL]") . ", Created: {$s->created_at}\n";
    }
} else {
    echo "- No subscribers found.\n";
}

// 4. Code Verification (File content check)
echo "\n[4] Server File Verification:\n";
$controllerPath = app_path('Http/Controllers/Api/SettingsController.php');
if (file_exists($controllerPath)) {
    $content = file_get_contents($controllerPath);
    if (strpos($content, 'opening_soon_video') !== false) {
        echo "- SettingsController correctly contains 'opening_soon_video' key.\n";
    } else {
        echo "- CRITICAL: SettingsController DOES NOT contain new keys!\n";
    }
} else {
    echo "- CRITICAL: SettingsController file not found at $controllerPath\n";
}

// 5. Environment
echo "\n[5] Environment Check:\n";
echo "- APP_URL: " . config('app.url') . "\n";
echo "- Cache Driver: " . config('cache.default') . "\n";
echo "- Base Path: " . base_path() . "\n";
echo "- App Path: " . app_path() . "\n";

echo "\n=== END DEBUG ===\n";
