<?php

use App\Models\Product;
use App\Models\Review;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Approving all existing reviews...\n";
Review::where('is_approved', false)->update(['is_approved' => true]);

echo "Syncing Product Stats...\n";

$products = Product::all();
echo "Found " . $products->count() . " products.\n";

foreach ($products as $product) {
    $stats = Review::where('product_id', $product->id)
        ->selectRaw('COUNT(*) as count, AVG(rating) as average')
        ->first();

    $count = $stats->count ?? 0;
    $rating = round($stats->average ?? 5.0, 1);

    $product->update([
        'reviews_count' => $count,
        'rating' => $rating,
    ]);

    echo "✅ Synced: [{$product->name}] -> Avis: {$count}, Note: {$rating}/5\n";
}

echo "Done!\n";
