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
        $path = $file->store('settings', 'public');
        $url = asset('storage/' . $path);

        SiteSetting::setValue($validated['key'], $url, $request->user()->id);

        return response()->json([
            'url' => $url,
            'message' => 'Fond d\'écran mis à jour',
        ]);
    }
}
