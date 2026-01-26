<?php
// rayova/public/log_viewer.php

$logFile = __DIR__ . '/../storage/logs/laravel.log';

echo "<h1>Rayova Log Viewer (Last 100 Lines)</h1>";
echo "<p>Log Path: $logFile</p>";

if (!file_exists($logFile)) {
    echo "<h2 style='color:orange'>Log file not found! (Maybe no errors yet?)</h2>";
    exit;
}

$lines = file($logFile);
$lastLines = array_slice($lines, -100);
$content = implode("", $lastLines);

echo "<pre style='background: #111; color: #eee; padding: 20px; overflow: auto; white-space: pre-wrap;'>";
echo htmlspecialchars($content);
echo "</pre>";
