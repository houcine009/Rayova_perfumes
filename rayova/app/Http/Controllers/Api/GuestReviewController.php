<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GuestReviewController extends Controller
{
    /**
     * Handle the guest review submission.
     * Use a dedicated controller to avoid any middleware or inheritance issues.
     */
    public function submit(Request $request): JsonResponse
    {
        // Log the request method for debugging if needed
        // \Log::info('Guest Review Submission Attempt', ['method' => $request->method(), 'data' => $request->all()]);

        if (!$request->isMethod('post')) {
            return response()->json([
                'message' => 'Veuillez utiliser la méthode POST pour soumettre un avis.',
                'current_method' => $request->method()
            ], 405);
        }

        $validated = $request->validate([
            'product_id' => 'required|uuid|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ]);

        // Capture user if logged in, but don't require it
        $user = Auth::guard('sanctum')->user();

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

        // All guest/non-admin reviews must be approved manually
        $validated['is_approved'] = ($user && $user->isAdmin()) ? true : false;

        $review = Review::create($validated);

        return response()->json([
            'data' => $review->load('user.profile'),
            'message' => 'Avis envoyé ! Il sera visible après modération.',
        ], 201);
    }
}
