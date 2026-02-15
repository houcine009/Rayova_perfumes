<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// 🚀 GLOBAL BYPASS ROUTE (Bypasses API location blocks and middleware)
Route::post('/submit-opinion', [\App\Http\Controllers\Api\ReviewController::class, 'storePublic']);
