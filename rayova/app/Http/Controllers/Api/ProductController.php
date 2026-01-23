<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('media', 'categories');

        // Filter by active status for public
        if (!$request->user() || !$request->user()->isAdmin()) {
            $query->active();
        }

        // Optional filters
        if ($request->has('featured') && $request->featured) {
            $query->featured();
        }

        if ($request->has('gender')) {
            $query->byGender($request->gender);
        }

        if ($request->has('category')) {
            $categorySlug = $request->category;
            
            if (in_array($categorySlug, ['homme', 'femme'])) {
                $query->where(function($q) use ($categorySlug) {
                    $q->whereHas('categories', function ($subQ) use ($categorySlug) {
                        $subQ->where('slug', $categorySlug);
                    })
                    ->orWhere('gender', $categorySlug)
                    ->orWhere('gender', 'unisexe');
                });
            } else {
                $query->whereHas('categories', function ($q) use ($categorySlug) {
                    $q->where('slug', $categorySlug);
                });
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 20);
        
        if ($request->has('limit')) {
            $products = $query->limit($request->limit)->get();
            return response()->json(['data' => $products]);
        }

        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with('media', 'categories', 'reviews.user')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json(['data' => $product]);
    }

    public function showById(string $id): JsonResponse
    {
        $product = Product::with('media', 'categories')
            ->findOrFail($id);

        return response()->json(['data' => $product]);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|unique:products,slug',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
                'original_price' => 'nullable|numeric|min:0',
                'sku' => 'nullable|string|unique:products,sku',
                'stock_quantity' => 'nullable|integer|min:0',
                'gender' => 'required|in:homme,femme,unisexe,niche',
                'is_featured' => 'nullable|boolean',
                'is_new' => 'nullable|boolean',
                'is_active' => 'nullable|boolean',
                'volume_ml' => 'nullable|integer|min:0',
                'notes_top' => 'nullable|string',
                'notes_heart' => 'nullable|string',
                'notes_base' => 'nullable|string',
                'brand' => 'nullable|string|max:255',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'uuid|exists:categories,id',
            ]);

            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            // Make slug unique
            $baseSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }

            $categoryIds = $validated['category_ids'] ?? [];
            unset($validated['category_ids']);

            // Convert empty SKU to null to avoid unique constraint violations
            if (empty($validated['sku'])) {
                $validated['sku'] = null;
            }

            // Ensure stock_quantity is not null (DB requires integer, defaults to 0)
            $validated['stock_quantity'] = $validated['stock_quantity'] ?? 0;

            $product = Product::create($validated);

            // Attach categories
            if (!empty($categoryIds)) {
                $product->categories()->attach($categoryIds);
            }

            return response()->json([
                'data' => $product->load('media', 'categories'),
                'message' => 'Produit créé avec succès',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du produit: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'slug' => 'sometimes|string|unique:products,slug,' . $id,
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'sometimes|numeric|min:0',
                'original_price' => 'nullable|numeric|min:0',
                'sku' => 'nullable|string|unique:products,sku,' . $id,
                'stock_quantity' => 'nullable|integer|min:0',
                'gender' => 'sometimes|in:homme,femme,unisexe,niche',
                'is_featured' => 'nullable|boolean',
                'is_new' => 'nullable|boolean',
                'is_active' => 'nullable|boolean',
                'volume_ml' => 'nullable|integer|min:0',
                'notes_top' => 'nullable|string',
                'notes_heart' => 'nullable|string',
                'notes_base' => 'nullable|string',
                'brand' => 'nullable|string|max:255',
                'category_ids' => 'nullable|array',
                'category_ids.*' => 'uuid|exists:categories,id',
            ]);

            $categoryIds = $validated['category_ids'] ?? null;
            unset($validated['category_ids']);

            if (array_key_exists('stock_quantity', $validated)) {
                 $validated['stock_quantity'] = $validated['stock_quantity'] ?? 0;
            }

            $product->update($validated);

            // Sync categories if provided
            if ($categoryIds !== null) {
                $product->categories()->sync($categoryIds);
            }

            return response()->json([
                'data' => $product->fresh()->load('media', 'categories'),
                'message' => 'Produit mis à jour',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la modification du produit: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Produit supprimé',
        ]);
    }

    public function addMedia(Request $request, string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'url' => 'nullable|string',
            'file' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,mp4,mov,avi,wmv|max:51200', // 50MB max
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $url = $validated['url'] ?? null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            // Check if Cloudinary is configured
            if (!empty(config('cloudinary.cloud_name')) || !empty(config('cloudinary.cloud_url'))) {
                try {
                    $resourceType = str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';
                    
                    $result = Cloudinary::upload($file->getRealPath(), [
                        'folder' => 'rayova/products',
                        'resource_type' => $resourceType,
                        'public_id' => Str::uuid()->toString(),
                    ]);
                    
                    $url = $result->getSecurePath();
                } catch (\Exception $e) {
                    // Fall back to local storage if Cloudinary fails
                    \Log::warning('Cloudinary upload failed, falling back to local: ' . $e->getMessage());
                    $path = $file->store('products', 'public');
                    $url = asset(Storage::url($path));
                }
            } else {
                // Local storage fallback
                $path = $file->store('products', 'public');
                $url = asset(Storage::url($path));
            }
        }

        if (!$url) {
            return response()->json(['message' => 'L\'URL ou un fichier est requis'], 422);
        }

        $mediaData = [
            'product_id' => $product->id,
            'url' => $url,
            'alt_text' => $validated['alt_text'] ?? null,
            'is_primary' => $validated['is_primary'] ?? false,
            'display_order' => $validated['display_order'] ?? 0,
        ];

        if (!empty($mediaData['is_primary'])) {
            $product->media()->update(['is_primary' => false]);
        }

        $media = ProductMedia::create($mediaData);

        return response()->json([
            'data' => $media,
            'message' => 'Média ajouté',
        ], 201);
    }

    public function deleteMedia(string $id): JsonResponse
    {
        $media = ProductMedia::findOrFail($id);
        $media->delete();

        return response()->json([
            'message' => 'Média supprimé',
        ]);
    }
}
