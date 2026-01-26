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
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'slug' => 'nullable|string|unique:categories,slug',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|file|image|max:10240', // 10MB max
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $validated['mime_type'] = $file->getMimeType();
            $validated['file_data'] = base64_encode(file_get_contents($file->getRealPath()));
            // URL will be set after creation
            $validated['image_url'] = '';
        }

        unset($validated['image_file']);
        $category = Category::create($validated);

        if ($category->file_data) {
            $category->image_url = url('/api/media/db/category/' . $category->id);
            $category->save();
        }

        return response()->json([
            'data' => $category,
            'message' => 'Catégorie créée avec succès',
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'slug' => 'sometimes|string|unique:categories,slug,' . $id,
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|file|image|max:10240', // 10MB max
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $validated['mime_type'] = $file->getMimeType();
            $validated['file_data'] = base64_encode(file_get_contents($file->getRealPath()));
            $validated['image_url'] = url('/api/media/db/category/' . $category->id);
        }

        unset($validated['image_file']);
        $category->update($validated);

        return response()->json([
            'data' => $category,
            'message' => 'Catégorie mise à jour',
        ]);
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
