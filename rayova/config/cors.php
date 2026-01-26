<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_merge(
        [
            'https://rayovaparfums.com',
            'https://www.rayovaparfums.com',
            'http://localhost:5173',
            'http://localhost:3000',
        ],
        explode(',', env('CORS_ALLOWED_ORIGINS', ''))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
