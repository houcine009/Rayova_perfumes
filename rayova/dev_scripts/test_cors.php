<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

echo json_encode([
    "status" => "ok",
    "message" => "Backend is reachable!",
    "app_url" => env('APP_URL'),
    "scheme" => request()->getScheme(),
    "cors_origin" => request()->headers->get('Origin'),
    "time" => now()->toDateTimeString()
]);
