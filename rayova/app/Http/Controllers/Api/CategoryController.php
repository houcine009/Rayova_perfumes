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
        \Log::info('Category Store [V4.1]:', $request->all());
        try {
            $validator = \Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string',
                'description' => 'nullable|string',
                'image_file' => 'nullable|max:51200', // 50MB Max
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable', // Permissive for V4.1
            ]);

            if ($validator->fails()) {
                \Log::warning('Category Store Validation Failed [V4.1]:', $validator->errors()->toArray());
                return response()->json([
                    'message' => '[V4.1 Debug] Erreur de validation : ' . $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Explicit cast for V4.1 multipart safety
            if ($request->has('is_active')) {
                $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $validated['mime_type'] = $file->getMimeType();
                $validated['file_data'] = base64_encode(file_get_contents($file->getRealPath()));
                $validated['image_url'] = 'db_location';
            }

            unset($validated['image_file']);
            $category = Category::create($validated);

            if ($category->image_url === 'db_location') {
                $category->image_url = url('/api/media/db/category/' . $category->id);
                $category->save();
            }

            return response()->json(['data' => $category, 'message' => 'Catégorie créée [V4.1]'], 201);
        } catch (\Exception $e) {
            \Log::error('Category Store Error [V4.1]: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur [V4.1] : ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        \Log::info('Category Update [V4.1] for ID ' . $id . ':', $request->all());
        try {
            $category = Category::findOrFail($id);

            $validator = \Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'slug' => 'sometimes|string',
                'description' => 'nullable|string',
                'image_file' => 'nullable|max:51200', // 50MB Max
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable', // Permissive for V4.1
            ]);

            if ($validator->fails()) {
                \Log::warning('Category Update Validation Failed [V4.1]:', $validator->errors()->toArray());
                return response()->json([
                    'message' => '[V4.1 Debug] Erreur de validation : ' . $validator->errors()->first(),
                    'errors' => $validator->errors()
                ], 422);
            }

            $validated = $validator->validated();

            // Explicit cast for V4.1 multipart safety
            if ($request->has('is_active')) {
                $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $validated['mime_type'] = $file->getMimeType();
                $validated['file_data'] = base64_encode(file_get_contents($file->getRealPath()));
                $validated['image_url'] = url('/api/media/db/category/' . $category->id);
            }

            unset($validated['image_file']);
            $category->update($validated);

            return response()->json(['data' => $category, 'message' => 'Catégorie mise à jour [V4.1]']);
        } catch (\Exception $e) {
            \Log::error('Category Update Error [V4.1]: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur [V4.1] : ' . $e->getMessage()], 500);
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
