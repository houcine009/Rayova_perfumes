<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $stats = [
            'products' => [
                'total' => Product::count(),
                'active' => Product::active()->count(),
                'featured' => Product::featured()->count(),
                'low_stock' => Product::where('stock_quantity', '<', 10)->count(),
            ],
            'categories' => [
                'total' => Category::count(),
                'active' => Category::active()->count(),
            ],
            'orders' => [
                'total' => Order::count(),
                'pending' => Order::byStatus('pending')->count(),
                'processing' => Order::whereIn('status', ['confirmed', 'processing'])->count(),
                'completed' => Order::byStatus('delivered')->count(),
                'revenue' => Order::whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])->sum('total'),
                'today' => Order::whereDate('created_at', today())->count(),
                'this_month' => Order::whereMonth('created_at', now()->month)->count(),
            ],
            'users' => [
                'total' => User::count(),
                'admins' => User::whereIn('role', ['admin', 'super_admin'])->count(),
            ],
            'reviews' => [
                'total' => Review::count(),
                'pending' => Review::pending()->count(),
                'approved' => Review::approved()->count(),
            ],
        ];

        return response()->json(['data' => $stats]);
    }

    public function recentOrders(): JsonResponse
    {
        $orders = Order::with('items', 'user.profile')
            ->recent()
            ->limit(10)
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function topProducts(): JsonResponse
    {
        $products = Product::withCount('orderItems')
            ->orderBy('order_items_count', 'desc')
            ->limit(5)
            ->get();

        return response()->json(['data' => $products]);
    }
}
