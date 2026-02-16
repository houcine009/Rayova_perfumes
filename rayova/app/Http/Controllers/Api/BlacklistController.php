<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlacklistedPhone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlacklistController extends Controller
{
    public function index(): JsonResponse
    {
        $blacklist = BlacklistedPhone::orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $blacklist]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|unique:blacklisted_phones,phone',
            'reason' => 'nullable|string',
        ]);

        $entry = BlacklistedPhone::create($validated);

        return response()->json([
            'data' => $entry,
            'message' => 'Numéro ajouté à la liste noire',
        ], 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $entry = BlacklistedPhone::findOrFail($id);
        $entry->delete();

        return response()->json([
            'message' => 'Numéro retiré de la liste noire',
        ]);
    }
}
