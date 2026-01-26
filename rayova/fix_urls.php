<?php
/**
 * RAYOVA URL REPAIR V12.2
 * Scans the database and fixes broken or localhost URLs.
 */

use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Category;
use App\Models\ProductMedia;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "<h1>Rayova Media Detective</h1>";

// 1. Check APP_URL
$envUrl = env('APP_URL');
echo "<p><strong>Environment APP_URL:</strong> " . htmlspecialchars($envUrl) . "</p>";

if (str_contains($envUrl, 'localhost')) {
    echo "<h2 style='color:red'>WARNING: APP_URL is still localhost!</h2>";
    echo "<p>You MUST run: <code>sed -i 's|APP_URL=http://localhost:8000|APP_URL=https://api.rayovaparfums.com|g' .env</code></p>";
}

// 2. Fix Categories
echo "<h2>Scanning Categories...</h2>";
$categories = Category::whereNotNull('image_url')->get();
$fixedCats = 0;

foreach ($categories as $cat) {
    echo "<div>Category: " . htmlspecialchars($cat->name);
    echo "<br>Original URL: " . htmlspecialchars($cat->image_url);
    
    // Fix Relative
    if (str_starts_with($cat->image_url, '/storage/')) {
        $newUrl = 'https://api.rayovaparfums.com' . $cat->image_url;
        $cat->image_url = $newUrl;
        $cat->save();
        echo "<br><strong style='color:green'>FIXED Relative -> Absolute</strong>";
        $fixedCats++;
    }
    // Fix Localhost
    elseif (str_contains($cat->image_url, 'localhost')) {
        $newUrl = str_replace(['http://localhost:8000', 'http://localhost'], 'https://api.rayovaparfums.com', $cat->image_url);
        $cat->image_url = $newUrl;
        $cat->save();
        echo "<br><strong style='color:green'>FIXED Localhost -> Production</strong>";
        $fixedCats++;
    }
    // Fix HTTP -> HTTPS
    elseif (str_starts_with($cat->image_url, 'http://')) {
        $newUrl = str_replace('http://', 'https://', $cat->image_url);
        $cat->image_url = $newUrl;
        $cat->save();
        echo "<br><strong style='color:green'>FIXED HTTP -> HTTPS</strong>";
        $fixedCats++;
    } else {
        echo "<br><span style='color:blue'>OK</span>";
    }
    echo "</div><hr>";
}

// 3. Fix Product Media
echo "<h2>Scanning Products...</h2>";
$media = ProductMedia::all();
$fixedMedia = 0;

foreach ($media as $m) {
    echo "<div>Product Media ID: " . $m->id;
    echo "<br>Original URL: " . htmlspecialchars($m->url);
    
    if (str_starts_with($m->url, '/storage/')) {
        $newUrl = 'https://api.rayovaparfums.com' . $m->url;
        $m->url = $newUrl;
        $m->save();
        echo "<br><strong style='color:green'>FIXED Relative -> Absolute</strong>";
        $fixedMedia++;
    }
    elseif (str_contains($m->url, 'localhost')) {
        $newUrl = str_replace(['http://localhost:8000', 'http://localhost'], 'https://api.rayovaparfums.com', $m->url);
        $m->url = $newUrl;
        $m->save();
        echo "<br><strong style='color:green'>FIXED Localhost -> Production</strong>";
        $fixedMedia++;
    }
    elseif (str_starts_with($m->url, 'http://')) {
        $newUrl = str_replace('http://', 'https://', $m->url);
        $m->url = $newUrl;
        $m->save();
        echo "<br><strong style='color:green'>FIXED HTTP -> HTTPS</strong>";
        $fixedMedia++;
    } else {
        echo "<br><span style='color:blue'>OK</span>";
    }
    echo "</div><hr>";
}

echo "<h3>Summary</h3>";
echo "Categories Fixed: $fixedCats<br>";
echo "Product Media Fixed: $fixedMedia<br>";
echo "<p>Run <code>php artisan optimize:clear</code> after this.</p>";
