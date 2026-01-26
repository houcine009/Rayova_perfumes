<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        // Filter by active status for public
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->active();
        }

        $categories = $query->ordered()->get();

        return response()->json(['data' => $categories]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $category]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                'slug' => 'nullable|string|unique:categories,slug',
                'description' => 'nullable|string',
                'image_file' => 'nullable|file|max:30720', // Explicitly marked as file, up to 30MB
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                if (!$file->isValid()) {
                    return response()->json(['message' => 'Fichier de catégorie invalide.'], 422);
                }
                $validated['mime_type'] = $file->getMimeType();
                $validated['file_data'] = base64_encode(file_get_contents($file->getRealPath()));
                // Valid placeholder for non-null DB constraint
                $validated['image_url'] = 'db_location';
            }

            unset($validated['image_file']);
            $category = Category::create($validated);

            if ($category->image_url === 'db_location') {
                $category->image_url = url('/api/media/db/category/' . $category->id);
                $category->save();
            }

            return response()->json(['data' => $category, 'message' => 'Catégorie créée'], 201);
        } catch (\Exception $e) {
            \Log::error('Category Store Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur de création : ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $category = Category::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
                'slug' => 'sometimes|string|unique:categories,slug,' . $id,
                'description' => 'nullable|string',
                'image_file' => 'nullable|file|max:30720', // Explicitly marked as file, up to 30MB
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable|boolean',
            ]);

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                if (!$file->isValid()) {
                    return response()->json(['message' => 'Fichier de mise à jour invalide.'], 422);
                }
                $validated['mime_type'] = $file->getMimeType();
                $validated['file_data'] = base64_encode(file_get_contents($file->getRealPath()));
                $validated['image_url'] = url('/api/media/db/category/' . $category->id);
            }

            unset($validated['image_file']);
            $category->update($validated);

            return response()->json(['data' => $category, 'message' => 'Catégorie mise à jour']);
        } catch (\Exception $e) {
            \Log::error('Category Update Error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur mise à jour : ' . $e->getMessage()], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Catégorie supprimée',
        ]);
    }
}
