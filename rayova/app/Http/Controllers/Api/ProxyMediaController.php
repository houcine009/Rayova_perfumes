<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ProductMedia;
use App\Models\SiteMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ProxyMediaController extends Controller
{
    public function stream(string $type, string $id)
    {
        try {
            $media = null;
            if ($type === 'category') {
                $media = Category::find($id);
            } elseif ($type === 'product') {
                $media = ProductMedia::find($id);
            } elseif ($type === 'site') {
                $media = SiteMedia::find($id);
            }

            if (!$media || !$media->file_data) {
                // Return a transparent 1x1 pixel if not found to prevent broken image icons
                $transparent = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
                return response($transparent)
                    ->header('Content-Type', 'image/gif')
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Cache-Control', 'no-cache');
            }

            // Clean up data prefix if present (data:image/png;base64,...)
            $rawData = $media->file_data;
            if (str_contains($rawData, ',')) {
                $parts = explode(',', $rawData);
                $rawData = end($parts);
            }

            $decoded = base64_decode($rawData, true);
            if ($decoded === false) {
                \Log::error("ProxyMedia: Failed to decode base64 for $type:$id");
                return response('Error', 500);
            }

            return response($decoded)
                ->header('Content-Type', $media->mime_type ?? 'application/octet-stream')
                ->header('Content-Length', strlen($decoded))
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
                ->header('X-Content-Type-Options', 'nosniff');

        } catch (\Exception $e) {
            \Log::error("ProxyMedia Error: " . $e->getMessage());
            return response('Server Error', 500);
        }
    }
}
