<?php
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

$products = Product::all();
foreach ($products as $p) {
    echo "ID: " . $p->id . " | Name: " . $p->name . " | Price: " . $p->price . " (type: " . gettype($p->price) . ")\n";
}
