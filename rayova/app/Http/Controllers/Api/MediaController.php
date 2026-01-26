<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class MediaController extends Controller
{
    /**
     * Check if Cloudinary is configured
     */
    private function isCloudinaryConfigured(): bool
    {
        return !empty(config('cloudinary.cloud_name')) || !empty(config('cloudinary.cloud_url'));
    }

    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|max:51200', 
                'folder' => 'nullable|string|max:50',
                'key' => 'nullable|string|max:255',
            ]);

            $file = $request->file('file');
            if (!$file || !$file->isValid()) {
                return response()->json(['message' => 'Le fichier est invalide.'], 422);
            }

            $folder = $request->get('folder', 'uploads');
            $key = $request->get('key');

            // 1. Try Cloudinary if available
            if ($this->isCloudinaryConfigured()) {
                try {
                    $resourceType = str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';
                    $result = Cloudinary::upload($file->getRealPath(), [
                        'folder' => 'rayova/' . $folder,
                        'resource_type' => $resourceType,
                        'public_id' => \Illuminate\Support\Str::uuid()->toString(),
                    ]);
                    
                    return response()->json([
                        'url' => $result->getSecurePath(),
                        'path' => $result->getPublicId(),
                        'filename' => $file->getClientOriginalName(),
                        'original_name' => $file->getClientOriginalName(),
                        'size' => $file->getSize(),
                        'storage' => 'cloudinary',
                    ], 201);
                } catch (\Exception $e) {
                    \Log::warning('Cloudinary upload failed: ' . $e->getMessage());
                }
            }

            // 2. Fallback to Database storage
            if ($key) {
                $siteMedia = \App\Models\SiteMedia::updateOrCreate(
                    ['key' => $key],
                    [
                        'file_data' => base64_encode(file_get_contents($file->getRealPath())),
                        'mime_type' => $file->getMimeType(),
                        'filename' => $file->getClientOriginalName(),
                    ]
                );
                $url = url('/api/media/db/site/' . $siteMedia->id);
                $path = 'db_site_' . $siteMedia->id;
            } else {
                return response()->json([
                    'url' => null, 
                    'path' => 'db',
                    'filename' => $file->getClientOriginalName(),
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'file_data' => base64_encode(file_get_contents($file->getRealPath())), 
                    'storage' => 'database',
                ], 201);
            }

            return response()->json([
                'url' => $url,
                'path' => $path,
                'filename' => $file->getClientOriginalName(),
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'storage' => 'database',
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Upload Crash: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur Serveur : ' . $e->getMessage()], 500);
        }
    }

    public function serve(string $type, string $id)
    {
        $media = null;
        if ($type === 'product') {
            $media = \App\Models\ProductMedia::findOrFail($id);
        } elseif ($type === 'category') {
            $media = \App\Models\Category::findOrFail($id);
        } elseif ($type === 'site') {
            $media = \App\Models\SiteMedia::findOrFail($id);
        } else {
            return response()->json(['message' => 'Type de média invalide'], 400);
        }
        
        if (!$media->file_data) {
            return response()->json(['message' => 'Média non trouvé ou non stocké en base'], 404);
        }

        $data = base64_decode($media->file_data);
        
        return response($data)
            ->header('Content-Type', $media->mime_type ?? 'application/octet-stream')
            ->header('Cache-Control', 'public, max-age=31536000')
            ->header('Content-Disposition', 'inline; filename="' . ($media->name ?? $media->alt_text ?? 'media') . '"');
    }

    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;

        // Check if this is a Cloudinary public_id (contains 'rayova/')
        if ($this->isCloudinaryConfigured() && str_contains($path, 'rayova/')) {
            try {
                Cloudinary::destroy($path);
                return response()->json(['message' => 'Fichier supprimé']);
            } catch (\Exception $e) {
                \Log::warning('Cloudinary delete failed: ' . $e->getMessage());
            }
        }

        // Fallback: Local storage delete
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['message' => 'Fichier supprimé']);
        }

        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    public function deleteProductMedia(string $id): JsonResponse
    {
        $media = ProductMedia::findOrFail($id);
        
        // Check if URL is from Cloudinary
        if ($this->isCloudinaryConfigured() && str_contains($media->url, 'cloudinary.com')) {
            try {
                // Extract public_id from Cloudinary URL
                preg_match('/\/v\d+\/(.+)\.\w+$/', $media->url, $matches);
                if (!empty($matches[1])) {
                    Cloudinary::destroy($matches[1]);
                }
            } catch (\Exception $e) {
                \Log::warning('Cloudinary delete failed: ' . $e->getMessage());
            }
        } else {
            // Local storage delete
            $path = str_replace('/storage/', '', $media->url);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $media->delete();

        return response()->json(['message' => 'Média supprimé']);
    }
}

