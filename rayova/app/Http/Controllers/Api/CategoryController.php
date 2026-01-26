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
        \Log::info('Category Store [V11.0]:', $request->all());
        try {
            $validator = \Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string',
                'description' => 'nullable|string',
                'image_file' => 'nullable|max:20480', // 20MB
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => '[V11.0] Erreur : ' . $validator->errors()->first()], 422);
            }

            $validated = $validator->validated();
            if ($request->has('is_active')) {
                $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            // PRE-FILL with placeholder until ID is created
            if ($request->hasFile('image_file')) {
                $validated['image_url'] = 'proxy_pending';
            }

            unset($validated['image_file']);
            $category = Category::create($validated);

            if (($validated['image_url'] ?? '') === 'proxy_pending') {
                $file = $request->file('image_file');
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                
                // V11.0: Store DATA in file_data, but LINK in image_url
                $proxyUrl = url('/api/media/proxy/category/' . $category->id);
                
                $category->update([
                    'file_data' => $base64,
                    'mime_type' => $file->getMimeType(),
                    'image_url' => $proxyUrl
                ]);
            }

            return response()->json(['data' => $category, 'message' => 'Catégorie créée [V11.0]'], 201);
        } catch (\Exception $e) {
            \Log::error('Category Store Error [V11.0]: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur [V11.0] : ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        \Log::info('Category Update [V11.0] for ID ' . $id . ':', $request->all());
        try {
            $category = Category::findOrFail($id);

            $validator = \Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'slug' => 'sometimes|string',
                'description' => 'nullable|string',
                'image_file' => 'nullable|max:20480',
                'display_order' => 'nullable|integer',
                'is_active' => 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => '[V11.0] Erreur : ' . $validator->errors()->first()], 422);
            }

            $validated = $validator->validated();
            if ($request->has('is_active')) {
                $validated['is_active'] = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            }

            if ($request->hasFile('image_file')) {
                $file = $request->file('image_file');
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                
                // V11.0: Update to Proxy Link
                $proxyUrl = url('/api/media/proxy/category/' . $category->id);
                
                $validated['image_url'] = $proxyUrl;
                $validated['file_data'] = $base64;
                $validated['mime_type'] = $file->getMimeType();
            }

            unset($validated['image_file']);
            $category->update($validated);

            return response()->json(['data' => $category, 'message' => 'Catégorie mise à jour [V11.0]']);
        } catch (\Exception $e) {
            \Log::error('Category Update Error [V11.0]: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur [V11.0] : ' . $e->getMessage()], 500);
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
