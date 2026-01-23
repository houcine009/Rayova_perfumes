<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SiteSetting::all()->pluck('value', 'key');

        return response()->json(['data' => $settings]);
    }

    public function show(string $key): JsonResponse
    {
        $setting = SiteSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $setting->value]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required',
        ]);

        SiteSetting::setValue($key, $validated['value'], $request->user()->id);

        return response()->json([
            'data' => $validated['value'],
            'message' => 'Paramètre mis à jour',
        ]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
        ]);

        foreach ($validated['settings'] as $setting) {
            SiteSetting::setValue($setting['key'], $setting['value'], $request->user()->id);
        }

        return response()->json([
            'message' => 'Paramètres mis à jour',
        ]);
    }

    public function uploadBackground(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,mp4,mov,avi,wmv|max:51200', // 50MB max
            'key' => 'required|string|in:hero_background_url,hero_video_url',
        ]);

        $file = $request->file('file');
        $url = null;

        // Check if Cloudinary is configured
        if (!empty(config('cloudinary.cloud_name')) || !empty(config('cloudinary.cloud_url'))) {
            try {
                $resourceType = str_starts_with($file->getMimeType(), 'video/') ? 'video' : 'image';
                
                $result = \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'rayova/settings',
                    'resource_type' => $resourceType,
                    'public_id' => \Illuminate\Support\Str::uuid()->toString(),
                ]);
                
                $url = $result->getSecurePath();
            } catch (\Exception $e) {
                \Log::warning('Cloudinary upload failed, falling back to local: ' . $e->getMessage());
            }
        }
        
        // Fallback to local storage
        if (!$url) {
            $path = $file->store('settings', 'public');
            $url = asset('storage/' . $path);
        }

        SiteSetting::setValue($validated['key'], $url, $request->user()->id);

        return response()->json([
            'url' => $url,
            'message' => 'Fond d\'écran mis à jour',
        ]);
    }

    public function storageStatus(): JsonResponse
    {
        $cloudinaryName = config('cloudinary.cloud_name');
        $cloudinaryUrl = config('cloudinary.cloud_url');
        $isConfigured = !empty($cloudinaryName) || !empty($cloudinaryUrl);

        return response()->json([
            'data' => [
                'type' => $isConfigured ? 'cloudinary' : 'local',
                'is_configured' => $isConfigured,
                'cloud_name' => $cloudinaryName ? substr($cloudinaryName, 0, 3) . '***' : null,
                'message' => $isConfigured 
                    ? 'Cloudinary est configuré et actif.' 
                    : 'Cloudinary n\'est pas configuré. Les fichiers sont stockés localement et seront supprimés à chaque redéploiement.',
            ]
        ]);
    }
}
