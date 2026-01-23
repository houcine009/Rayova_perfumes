<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Cloudinary settings.
    |
    */

    'cloud_url' => env('CLOUDINARY_URL'),

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
    'secure' => env('CLOUDINARY_SECURE', true),

    /*
    |--------------------------------------------------------------------------
    | Upload Settings
    |--------------------------------------------------------------------------
    */

    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),
    'notification_url' => env('CLOUDINARY_NOTIFICATION_URL'),
];
