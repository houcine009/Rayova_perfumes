<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewsletterSubscriber::query();

        if ($request->has('active_only') && $request->active_only) {
            $query->active();
        }

        if ($request->has('search')) {
            $query->where('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
        }

        $subscribers = $query->orderBy('subscribed_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($subscribers);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'phone' => 'nullable|string',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $validated['email'])->first();

        if ($subscriber) {
            if ($subscriber->is_active) {
                // Update phone if provided
                if (isset($validated['phone'])) {
                    $subscriber->update(['phone' => $validated['phone']]);
                }
                
                return response()->json([
                    'message' => 'Cet email est déjà inscrit à la newsletter',
                ], 422);
            }

            // Reactivate subscription
            $subscriber->update([
                'is_active' => true,
                'phone' => $validated['phone'] ?? $subscriber->phone,
                'unsubscribed_at' => null,
                'subscribed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Inscription réactivée avec succès',
            ]);
        }

        NewsletterSubscriber::create([
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Inscription réussie à la newsletter',
        ], 201);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:newsletter_subscribers,email',
        ]);

        $subscriber = NewsletterSubscriber::where('email', $validated['email'])->first();
        $subscriber->unsubscribe();

        return response()->json([
            'message' => 'Désinscription réussie',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return response()->json([
            'message' => 'Abonné supprimé',
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total' => NewsletterSubscriber::count(),
            'active' => NewsletterSubscriber::active()->count(),
            'inactive' => NewsletterSubscriber::where('is_active', false)->count(),
            'today' => NewsletterSubscriber::whereDate('subscribed_at', today())->count(),
            'this_month' => NewsletterSubscriber::whereMonth('subscribed_at', now()->month)->count(),
        ];

        return response()->json(['data' => $stats]);
    }
}
