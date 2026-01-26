<?php
/**
 * RAYOVA DIAGNOSTIC TOOL V1.0
 * Checks if the database holds valid Data-URIs
 */

define('LARAVEL_START', microtime(true));

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

echo "<h1>Rayova Media Diagnostic</h1>";

try {
    // Check Category
    $category = Category::whereNotNull('image_url')->where('image_url', '!=', '')->latest()->first();
    
    echo "<h2>Latest Category Check</h2>";
    if ($category) {
        echo "<p><strong>Name:</strong> " . htmlspecialchars($category->name) . "</p>";
        $len = strlen($category->image_url);
        echo "<p><strong>Image URL Length:</strong> " . $len . " chars</p>";
        echo "<p><strong>First 50 chars:</strong> " . htmlspecialchars(substr($category->image_url, 0, 50)) . "...</p>";
        
        if ($len > 100) {
            echo "<h3>Preview:</h3>";
            echo "<img src='" . $category->image_url . "' style='max-width:300px; border:2px solid red;' />";
        } else {
            echo "<p style='color:red;'>Image URL is too short to be a valid Data-URI!</p>";
        }
    } else {
        echo "<p>No categories with images found.</p>";
    }

    // Check Product
    $productMedia = \App\Models\ProductMedia::latest()->first();
    echo "<h2>Latest Product Media Check</h2>";
    if ($productMedia) {
        $len = strlen($productMedia->url);
        echo "<p><strong>URL Length:</strong> " . $len . " chars</p>";
        echo "<p><strong>First 50 chars:</strong> " . htmlspecialchars(substr($productMedia->url, 0, 50)) . "...</p>";
        
        if ($len > 100) {
            echo "<h3>Preview:</h3>";
            echo "<img src='" . $productMedia->url . "' style='max-width:300px; border:2px solid blue;' />";
        } else {
            echo "<p style='color:red;'>Media URL is too short!</p>";
        }
    } else {
        echo "<p>No product media found.</p>";
    }

} catch (\Exception $e) {
    echo "<h2 style='color:red'>Error: " . $e->getMessage() . "</h2>";
}
