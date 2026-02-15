<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class GuestFeedbackController extends Controller
{
    /**
     * Handle guest feedback submission with strict validation and security headers.
     */
    public function store(Request $request): JsonResponse
    {
        // 1. Manual OPTIONS handling for aggressive CORS preflights
        if ($request->isMethod('OPTIONS')) {
            return response()->json(['status' => 'ok'], 200)
                ->header('Access-Control-Allow-Origin', $request->header('Origin') ?? '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }

        // 2. Strict Validation
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|uuid|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:100', // Limit title length
            'comment' => 'nullable|string|max:1000', // Limit comment length
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // 3. User Resolution (Optional)
        $user = Auth::guard('sanctum')->user();
        if ($user) {
            // Check for potential duplicates
            $exists = Review::where('product_id', $validated['product_id'])
                ->where('user_id', $user->id)
                ->exists();
            
            if ($exists) {
                return response()->json(['message' => 'Vous avez déjà donné un avis.'], 422);
            }
            $validated['user_id'] = $user->id;
        }

        // 4. Force Moderation
        $validated['is_approved'] = false; // Always false for public endpoint
        $validated['is_verified_purchase'] = false; // logic for verification is separate

        // 5. Create Review
        Review::create($validated);

        // 6. Return Clean Response
        return response()->json([
            'message' => 'Merci ! Votre avis a été reçu et sera publié après modération.',
        ], 201);
    }
}
