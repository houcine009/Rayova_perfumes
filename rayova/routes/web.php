<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// 🚀 BULLETPROOF WEB-API ACCESS (Bypasses API Middleware Group)
Route::any('/api/v3/guest/reviews/submit', [\App\Http\Controllers\Api\GuestReviewController::class, 'submit']);
