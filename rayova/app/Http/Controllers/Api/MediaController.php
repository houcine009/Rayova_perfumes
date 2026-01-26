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
        $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,mp4,webm,ogg|max:51200', // 50MB max
            'folder' => 'nullable|string|max:50',
        ]);

        $file = $request->file('file');
        $folder = $request->get('folder', 'uploads');
        
        // Check if Cloudinary is configured
        if ($this->isCloudinaryConfigured()) {
            try {
                // Upload to Cloudinary
                $resourceType = str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';
                
                $result = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'rayova/' . $folder,
                    'resource_type' => $resourceType,
                    'public_id' => Str::uuid()->toString(),
                ]);
                
                $url = $result->getSecurePath();
                $publicId = $result->getPublicId();
                
                return response()->json([
                    'url' => $url,
                    'path' => $publicId, // Store public_id as path for deletion
                    'filename' => basename($url),
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'storage' => 'cloudinary',
                ], 201);
            } catch (\Exception $e) {
                // Fall back to local storage if Cloudinary fails
                \Log::warning('Cloudinary upload failed, falling back to local: ' . $e->getMessage());
            }
        }
        
        // Fallback to Database storage (ensures persistence on ephemeral hosts)
        if ($key) {
            // If a key is provided, store in SiteMedia
            $siteMedia = \App\Models\SiteMedia::updateOrCreate(
                ['key' => $key],
                [
                    'file_data' => base64_encode(file_get_contents($file->getRealPath())),
                    'mime_type' => $file->getMimeType(),
                    'filename' => $file->getClientOriginalName(),
                ]
            );
            $url = url('/api/media/db/site/' . $siteMedia->id);
            $path = 'db_site_' . $siteMedia->id; // Unique path for site media
        } else {
            // General database storage for other media types
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();
            $fileData = base64_encode(file_get_contents($file->getRealPath()));

            return response()->json([
                'url' => null, // Frontend will need to handle this or we return a temp URL
                'path' => 'db',
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $mimeType,
                'file_data' => $fileData, // Send back so ProductController can store it
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

