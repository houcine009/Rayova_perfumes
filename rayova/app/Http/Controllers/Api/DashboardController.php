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
    public function stats(\Illuminate\Http\Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // Default to month
        $startDate = null;

        switch ($period) {
            case 'day':
                $startDate = now()->startOfDay();
                break;
            case 'month':
                $startDate = now()->startOfMonth();
                break;
            case 'year':
                $startDate = now()->startOfYear();
                break;
            case 'all':
                $startDate = null;
                break;
        }

        $query = Order::query();
        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }

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
                'total' => (clone $query)->count(),
                'pending' => (clone $query)->where('status', 'pending')->count(),
                'processing' => (clone $query)->whereIn('status', ['confirmed', 'processing'])->count(),
                'completed' => (clone $query)->where('status', 'delivered')->count(),
                'revenue' => (float) (clone $query)->where('status', 'delivered')->sum('subtotal'),
                'total_shipping' => (float) (clone $query)->where('status', 'delivered')->sum('shipping_cost'),
                'today' => Order::whereDate('created_at', today())->count(),
                'this_month' => Order::whereMonth('created_at', now()->month)->count(),
                'period_label' => $period,
            ],
            'users' => [
                'total' => User::count(),
                'admins' => User::whereIn('role', ['admin', 'super_admin'])->count(),
                'new_period' => $startDate ? User::where('created_at', '>=', $startDate)->count() : User::count(),
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

    public function topProducts(\Illuminate\Http\Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');
        $startDate = null;

        switch ($period) {
            case 'day':
                $startDate = now()->startOfDay();
                break;
            case 'month':
                $startDate = now()->startOfMonth();
                break;
            case 'year':
                $startDate = now()->startOfYear();
                break;
        }

        $query = Product::withCount(['orderItems' => function ($q) use ($startDate) {
            if ($startDate) {
                $q->whereHas('order', function ($oq) use ($startDate) {
                    $oq->where('created_at', '>=', $startDate);
                });
            }
        }]);

        $products = $query->orderBy('order_items_count', 'desc')
            ->limit(5)
            ->get();

        return response()->json(['data' => $products]);
    }
}
