<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Order::with('items.product', 'user.profile');

        // Non-admin users can only see their own orders
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Filters for admin
        if ($user->isAdmin()) {
            if ($request->has('status')) {
                $query->byStatus($request->status);
            }

            if ($request->has('period')) {
                $period = $request->period;
                switch ($period) {
                    case 'day':
                        $query->whereDate('created_at', today());
                        break;
                    case 'month':
                        $query->whereMonth('created_at', now()->month);
                        break;
                    case 'year':
                        $query->whereYear('created_at', now()->year);
                        break;
                }
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhere('customer_name', 'like', "%{$search}%")
                      ->orWhere('shipping_phone', 'like', "%{$search}%");
                });
            }
        }

        $orders = $query->recent()->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /* ... (show and track methods) ... */

    public function stats(Request $request): JsonResponse
    {
        $period = $request->get('period', 'all');
        $query = Order::query();

        if ($period !== 'all') {
            switch ($period) {
                case 'day':
                    $query->whereDate('created_at', today());
                    break;
                case 'month':
                    $query->whereMonth('created_at', now()->month);
                    break;
                case 'year':
                    $query->whereYear('created_at', now()->year);
                    break;
            }
        }

        $stats = [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'confirmed' => (clone $query)->where('status', 'confirmed')->count(),
            'processing' => (clone $query)->where('status', 'processing')->count(),
            'shipped' => (clone $query)->where('status', 'shipped')->count(),
            'delivered' => (clone $query)->where('status', 'delivered')->count(),
            'cancelled' => (clone $query)->where('status', 'cancelled')->count(),
            'revenue' => (clone $query)->where('status', 'delivered')->sum('subtotal'),
            'total_shipping' => (clone $query)->where('status', 'delivered')->sum('shipping_cost'),
            'today' => Order::whereDate('created_at', today())->count(),
            'this_month' => Order::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
