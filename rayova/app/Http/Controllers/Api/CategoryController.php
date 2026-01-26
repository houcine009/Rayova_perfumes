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
        \Log::info('Category Store [V6.2]:', $request->all());
        try {
            $validator = \Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string',
                'description' => 'nullable|string',
                'image_file' => 'nullable|max:102400', // 100MB
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => '[V6.2] Erreur : ' . $validator->errors()->first()], 422);
            }

            $validated = $validator->validated();
            if ($request->has('is_active')) {
                $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $path = $file->store('categories', 'public');
                $validated['image_url'] = Storage::disk('public')->url($path);
            }

            unset($validated['image_file']);
            $category = Category::create($validated);

            return response()->json(['data' => $category, 'message' => 'Catégorie créée [V9.1]'], 201);
        } catch (\Exception $e) {
            \Log::error('Category Store Error [V9.1]: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur [V9.1] : ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        \Log::info('Category Update [V9.1] for ID ' . $id . ':', $request->all());
        try {
            $category = Category::findOrFail($id);

            $validator = \Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'slug' => 'sometimes|string',
                'description' => 'nullable|string',
                'image_file' => 'nullable|max:102400',
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => '[V9.1] Erreur : ' . $validator->errors()->first()], 422);
            }

            $validated = $validator->validated();
            if ($request->has('is_active')) {
                $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $path = $file->store('categories', 'public');
                $validated['image_url'] = Storage::disk('public')->url($path);
            }

            unset($validated['image_file']);
            $category->update($validated);

            return response()->json(['data' => $category, 'message' => 'Catégorie mise à jour [V9.1]']);
        } catch (\Exception $e) {
            \Log::error('Category Update Error [V9.1]: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur [V9.1] : ' . $e->getMessage()], 500);
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
