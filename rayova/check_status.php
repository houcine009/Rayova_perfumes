<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "--- NEWSLETTER_SUBSCRIBERS TABLE ---\n";
if (Schema::hasTable('newsletter_subscribers')) {
    $columns = Schema::getColumnListing('newsletter_subscribers');
    echo "Columns: " . implode(', ', $columns) . "\n";
    if (in_array('phone', $columns)) {
        echo "SUCCESS: 'phone' column exists.\n";
    } else {
        echo "FAILURE: 'phone' column MISSING.\n";
    }
} else {
    echo "FAILURE: table 'newsletter_subscribers' does not exist.\n";
}

echo "\n--- SETTINGS UPLOAD VALIDATION ---\n";
try {
    $reflection = new ReflectionClass(App\Http\Controllers\Api\SettingsController::class);
    $method = $reflection->getMethod('uploadBackground');
    $start_line = $method->getStartLine();
    $end_line = $method->getEndLine();
    $source = file($reflection->getFileName());
    $code = implode('', array_slice($source, $start_line - 1, $end_line - $start_line + 1));
    
    if (strpos($code, 'opening_soon_video') !== false) {
        echo "SUCCESS: 'opening_soon_video' found in SettingsController code.\n";
    } else {
        echo "FAILURE: 'opening_soon_video' NOT found in SettingsController code.\n";
    }
} catch (Exception $e) {
    echo "Error checking SettingsController: " . $e->getMessage() . "\n";
}

echo "\n--- RECENT MIGRATIONS ---\n";
$migrations = DB::table('migrations')->orderBy('id', 'desc')->limit(5)->get();
foreach ($migrations as $m) {
    echo "- " . $m->migration . "\n";
}
