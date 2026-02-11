<?php

use App\Models\Product;
use App\Models\Review;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Syncing Product Stats...\n";

$products = Product::all();

foreach ($products as $product) {
    $stats = Review::where('product_id', $product->id)
        ->where('is_approved', true)
        ->selectRaw('COUNT(*) as count, AVG(rating) as average')
        ->first();

    $product->update([
        'reviews_count' => $stats->count ?? 0,
        'rating' => round($stats->average ?? 5.0, 1),
    ]);

    echo "Synced Product: {$product->name} - Count: {$product->reviews_count}, Rating: {$product->rating}\n";
}

echo "Done!\n";
