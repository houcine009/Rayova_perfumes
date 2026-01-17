<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,mp4,webm,ogg|max:51200', // 50MB max
            'folder' => 'nullable|string|max:50',
        ]);

        $file = $request->file('file');
        $folder = $request->get('folder', 'uploads');
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Store file
        $path = $file->storeAs($folder, $filename, 'public');

        $url = asset(Storage::url($path));

        return response()->json([
            'url' => $url,
            'path' => $path,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ], 201);
    }

    public function delete(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->path;

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['message' => 'Fichier supprimé']);
        }

        return response()->json(['message' => 'Fichier non trouvé'], 404);
    }

    public function deleteProductMedia(string $id): JsonResponse
    {
        $media = ProductMedia::findOrFail($id);
        
        // Delete file from storage if it exists
        $path = str_replace('/storage/', '', $media->url);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $media->delete();

        return response()->json(['message' => 'Média supprimé']);
    }
}
