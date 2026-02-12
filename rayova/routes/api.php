<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::options('/{any}', function() {
    return response()->json(['status' => 'ok']);
})->where('any', '.*');

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/id/{id}', [ProductController::class, 'showById']);
Route::get('/media/proxy/{type}/{id}', [\App\Http\Controllers\Api\ProxyMediaController::class, 'stream']); // V11.0 Proxy Route
Route::get('/media/db/{type}/{id}{extension?}', [MediaController::class, 'serve'])->where('extension', '\..+');

// Public category routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Public review routes
Route::get('/products/{productId}/reviews', [ReviewController::class, 'productReviews']);

// Public settings routes
Route::get('/settings', [SettingsController::class, 'index']);
Route::get('/settings/{key}', [SettingsController::class, 'show']);

// Newsletter subscription
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:newsletter');
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

// Order placement (Public)
Route::post('/orders', [OrderController::class, 'store']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);

    // User orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // User reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/recent-orders', [DashboardController::class, 'recentOrders']);
        Route::get('/dashboard/top-products', [DashboardController::class, 'topProducts']);

        // Products management
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/products/{id}/media', [ProductController::class, 'addMedia']);
        Route::delete('/products/media/{id}', [ProductController::class, 'deleteMedia']);

        // Categories management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Orders management
        Route::get('/orders/stats', [OrderController::class, 'stats']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

        // Reviews management
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::put('/reviews/{id}/approve', [ReviewController::class, 'approve']);
        Route::put('/reviews/{id}/reject', [ReviewController::class, 'reject']);
        Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

        // Media upload
        Route::post('/media/upload', [MediaController::class, 'upload']);
        Route::delete('/media', [MediaController::class, 'delete']);
        Route::delete('/media/{id}', [MediaController::class, 'deleteProductMedia']);

        // Newsletter management
        Route::get('/newsletter', [NewsletterController::class, 'index']);
        Route::get('/newsletter/stats', [NewsletterController::class, 'stats']);
        Route::delete('/newsletter/{id}', [NewsletterController::class, 'destroy']);

        // Super admin routes
        Route::middleware('super_admin')->group(function () {
            // Users management
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/stats', [UserController::class, 'stats']);
            Route::get('/users/{id}', [UserController::class, 'show']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{id}/role', [UserController::class, 'updateRole']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);

            // Settings management
            Route::put('/settings/{key}', [SettingsController::class, 'update']);
            Route::get('/settings', [SettingsController::class, 'index']);
            Route::post('/settings/upload', [SettingsController::class, 'uploadBackground']);
            Route::post('/settings/bulk', [SettingsController::class, 'bulkUpdate']);
            Route::get('/storage/status', [SettingsController::class, 'storageStatus']);
        });
    });
});
