<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::with('user.profile', 'product');
        $user = $request->user();

        // Filter by product
        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Non-admin users can only see approved reviews
        if (!$user || !$user->isAdmin()) {
            $query->approved();
        }

        // Filter for pending reviews (admin only)
        if ($user && $user->isAdmin() && $request->has('pending')) {
            $query->pending();
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json($reviews);
    }

    public function productReviews(string $productId): JsonResponse
    {
        $reviews = Review::with('user.profile')
            ->where('product_id', $productId)
            ->approved()
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'count' => $reviews->count(),
            'average' => $reviews->avg('rating') ?? 0,
            'distribution' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
        ];

        return response()->json([
            'data' => $reviews,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        return $this->processSubmission($request, $request->user());
    }

    public function storePublic(Request $request): JsonResponse
    {
        // Explicitly use sanctum guard to find user if present, but allow guests
        $user = Auth::guard('sanctum')->user();
        return $this->processSubmission($request, $user);
    }

    private function processSubmission(Request $request, $user): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        // Check for duplicate review only if user is logged in
        if ($user) {
            $existingReview = Review::where('product_id', $validated['product_id'])
                ->where('user_id', $user->id)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'message' => 'Vous avez déjà donné un avis sur ce produit',
                ], 422);
            }
            $validated['user_id'] = $user->id;
        }

        // Manual Moderation: All reviews from guests or non-admin users must be approved
        $validated['is_approved'] = ($user && $user->isAdmin()) ? true : false;

        $review = Review::create($validated);

        return response()->json([
            'data' => $review->load('user.profile'),
            'message' => 'Avis envoyé ! Il sera visible après modération.',
        ], 201);
    }

    public function approve(string $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->is_approved = true;
        $review->save();

        return response()->json([
            'data' => $review,
            'message' => 'Avis approuvé',
        ]);
    }

    public function reject(string $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->is_approved = false;
        $review->save();

        return response()->json([
            'data' => $review,
            'message' => 'Avis rejeté',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $user = request()->user();

        // If not logged in, you can't delete anything (guests can't delete their own reviews without a session)
        if (!$user) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Non-admin can only delete their own reviews
        if (!$user->isAdmin() && $review->user_id !== $user->id) {
            abort(403, 'Non autorisé');
        }

        $review->delete();

        return response()->json([
            'message' => 'Avis supprimé',
        ]);
    }
}
