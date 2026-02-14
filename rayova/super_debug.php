<?php
/**
 * RAYOVA LIVE PATH DETECTOR & AUDIT
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

echo "=== RAYOVA SYSTEM AUDIT & PATH SYNC ===\n\n";

$currentPath = base_path();
$publicPath = public_path();
$uniqueId = uniqid('rayova_');
$testFile = $publicPath . '/path_sync_' . $uniqueId . '.txt';

// 1. Path Sync Test
echo "[1] Path Synchronization Test:\n";
echo "- Current Script Path: $currentPath\n";
echo "- Public Web Path: $publicPath\n";

if (@file_put_contents($testFile, $uniqueId)) {
    echo "- Created test file: /path_sync_$uniqueId.txt\n";
    echo "- ACTION REQUIRED: Try to visit: https://api.rayovaparfums.com/path_sync_$uniqueId.txt\n";
    echo "  (If you get 404, this directory is NOT live!)\n";
} else {
    echo "- WARNING: Cannot write to public directory!\n";
}

// 2. Data Persistence Check
echo "\n[2] Database & Model Audit:\n";
$subsCount = NewsletterSubscriber::count();
echo "- Total Subscribers: $subsCount\n";
$lastSub = NewsletterSubscriber::orderBy('created_at', 'desc')->first();
if ($lastSub) {
    echo "- Last Entry: Email: {$lastSub->email}, Phone: " . ($lastSub->phone ?? "[MISSING]") . "\n";
}

// 3. Security Whitelist Check
echo "\n[3] Security Audit (Upload Whitelist):\n";
$controllerFile = app_path('Http/Controllers/Api/SettingsController.php');
if (file_exists($controllerFile)) {
    $content = file_get_contents($controllerFile);
    $whitelistMatch = [];
    if (preg_match("/'key' => 'required\|string\|in:(.*?)'/", $content, $whitelistMatch)) {
        echo "- Current Whitelist: {$whitelistMatch[1]}\n";
        if (strpos($whitelistMatch[1], 'opening_soon_video') !== false) {
             echo "  SUCCESS: 'opening_soon_video' is whitelisted.\n";
        } else {
             echo "  FAILURE: 'opening_soon_video' NOT whitelisted in this file.\n";
        }
    }
}

// 4. Performance Check
echo "\n[4] Performance Audit:\n";
$cacheKeys = ['settings_all', 'setting_opening_soon'];
foreach ($cacheKeys as $key) {
    echo "- Cache Key '$key': " . (\Illuminate\Support\Facades\Cache::has($key) ? "EXISTS" : "MISSING (Normal if just cleared)") . "\n";
}

echo "\n=== END AUDIT ===\n";
