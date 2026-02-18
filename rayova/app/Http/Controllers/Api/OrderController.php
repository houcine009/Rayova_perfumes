<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $query = Order::with('items.product.media', 'user.profile');

            // Non-admin users can only see their own orders
            if (!$user->isAdmin()) {
                $query->where('user_id', $user->id);
            }

            // Filters for admin
            if ($user->isAdmin()) {
                if ($request->has('status') && $request->status !== 'all') {
                    $query->byStatus($request->status);
                }

                if ($request->has('period') && $request->period !== 'all') {
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

                if ($request->has('search') && !empty($request->search)) {
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
        } catch (\Exception $e) {
            Log::error('Order Index Error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'params' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erreur lors de la récupération des commandes', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $order = Order::with('items.product', 'user.profile')->findOrFail($id);

            // Non-admin users can only see their own orders
            if (!auth()->user()->isAdmin() && $order->user_id !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json(['data' => $order]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_name' => 'required|string|max:255',
                'shipping_address' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_postal_code' => 'nullable|string',
                'shipping_country' => 'nullable|string',
                'shipping_phone' => 'required|string',
                'whatsapp_phone' => 'nullable|string',
                'billing_address' => 'nullable|string',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|uuid|exists:products,id',
                'items.*.product_name' => 'required|string',
                'items.*.product_price' => 'required|numeric',
                'items.*.quantity' => 'required|integer|min:1',
                'subtotal' => 'required|numeric',
                'shipping_cost' => 'nullable|numeric',
                'total' => 'required|numeric',
            ]);

            return DB::transaction(function () use ($validated, $request) {
                $orderData = [
                    'customer_name' => $validated['customer_name'],
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_city' => $validated['shipping_city'],
                    'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                    'shipping_country' => $validated['shipping_country'] ?? 'Maroc',
                    'shipping_phone' => $validated['shipping_phone'],
                    'whatsapp_phone' => $validated['whatsapp_phone'] ?? $validated['shipping_phone'],
                    'billing_address' => $validated['billing_address'] ?? $validated['shipping_address'],
                    'notes' => $validated['notes'] ?? null,
                    'subtotal' => $validated['subtotal'],
                    'shipping_cost' => $validated['shipping_cost'] ?? 0,
                    'total' => $validated['total'],
                    'user_id' => auth('sanctum')->id(),
                    'status' => 'pending',
                ];
                
                $order = Order::create($orderData);

                foreach ($validated['items'] as $item) {
                    $order->items()->create([
                        'product_id' => $item['product_id'],
                        'product_name' => $item['product_name'],
                        'product_price' => $item['product_price'],
                        'quantity' => $item['quantity'],
                        'subtotal' => $item['product_price'] * $item['quantity'],
                    ]);

                    // Update product stock
                    $product = Product::find($item['product_id']);
                    if ($product) {
                        $product->decrement('stock_quantity', $item['quantity']);
                    }
                }

                return response()->json([
                    'message' => 'Commande créée avec succès',
                    'data' => $order->load('items.product')
                ], 201);
            });
        } catch (\Exception $e) {
            Log::error('Order Store Error: ' . $e->getMessage(), [
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la création de la commande: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Statut de la commande mis à jour avec succès',
            'data' => $order
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json(['message' => 'Commande supprimée avec succès']);
    }

    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => 'required|string',
        ]);

        $order = Order::with('items')->where('order_number', $request->order_number)->first();

        if (!$order) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        return response()->json(['data' => $order]);
    }

    public function stats(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', 'all');
            $query = Order::query();

            if ($period !== 'all') {
                switch ($period) {
                    case 'day':
                        $query->whereDate('created_at', today());
                        break;
                    case 'month':
                        $query->whereMonth('created_at', now()->month)
                              ->whereYear('created_at', now()->year);
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
                'revenue' => (clone $query)->where('status', 'delivered')->sum('total'), // Fixed to use total
                'total_shipping' => (clone $query)->where('status', 'delivered')->sum('shipping_cost'),
                'today' => Order::whereDate('created_at', today())->count(),
                'this_month' => Order::whereMonth('created_at', now()->month)
                                     ->whereYear('created_at', now()->year)->count(),
            ];

            return response()->json(['data' => $stats]);
        } catch (\Exception $e) {
            Log::error('Order Stats Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors du calcul des statistiques'], 500);
        }
    }
}
