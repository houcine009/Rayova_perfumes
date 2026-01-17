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

    public function show(string $id): JsonResponse
    {
        $order = Order::with('items.product', 'user.profile')->findOrFail($id);

        // Check authorization
        $user = request()->user();
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            abort(403, 'Non autorisé');
        }

        return response()->json(['data' => $order]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'shipping_address' => 'required|string',
            'shipping_city' => 'required|string|max:255',
            'shipping_postal_code' => 'nullable|string|max:20',
            'shipping_country' => 'nullable|string|max:255',
            'shipping_phone' => 'required|string|max:20',
            'whatsapp_phone' => 'nullable|string|max:20',
            'shipping_cost' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'billing_address' => 'nullable|string',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.product_name' => 'required|string',
            'items.*.product_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.subtotal' => 'nullable|numeric|min:0',
        ]);

        // Calculate totals
        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += $item['product_price'] * $item['quantity'];
        }

        $shippingCost = $request->input('shipping_cost', 0);
        $tax = 0; 
        $total = $request->input('total', $subtotal + $shippingCost + $tax);

        $order = Order::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'customer_name' => $validated['customer_name'],
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'tax' => $tax,
            'total' => $total,
            'shipping_address' => $validated['shipping_address'],
            'shipping_city' => $validated['shipping_city'],
            'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
            'shipping_country' => $validated['shipping_country'] ?? 'Maroc',
            'shipping_phone' => $validated['shipping_phone'],
            'whatsapp_phone' => $validated['whatsapp_phone'] ?? null,
            'billing_address' => $validated['billing_address'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        // Create order items
        foreach ($validated['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'product_name' => $item['product_name'],
                'product_price' => $item['product_price'],
                'quantity' => $item['quantity'],
                'subtotal' => $item['product_price'] * $item['quantity'],
            ]);
        }

        return response()->json([
            'data' => $order->load('items'),
            'message' => 'Commande créée avec succès',
        ], 201);
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'data' => $order,
            'message' => 'Statut de la commande mis à jour',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return response()->json([
            'message' => 'Commande supprimée',
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Order::count(),
            'pending' => Order::byStatus('pending')->count(),
            'confirmed' => Order::byStatus('confirmed')->count(),
            'processing' => Order::byStatus('processing')->count(),
            'shipped' => Order::byStatus('shipped')->count(),
            'delivered' => Order::byStatus('delivered')->count(),
            'cancelled' => Order::byStatus('cancelled')->count(),
            'revenue' => Order::whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])->sum('total'),
            'today' => Order::whereDate('created_at', today())->count(),
            'this_month' => Order::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
