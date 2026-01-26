<?php
/**
 * RAYOVA SYMLINK REPAIR V12.0
 * Restores the standard public/storage link.
 */

$target = __DIR__ . '/storage/app/public';
$link = __DIR__ . '/public/storage';

echo "<h1>Rayova Symlink Repair</h1>";
echo "<p>Target (Real Folder): $target</p>";
echo "<p>Link (Public Access): $link</p>";

if (file_exists($link)) {
    echo "<p>Removing broken link...</p>";
    unlink($link);
}

if (symlink($target, $link)) {
    echo "<h2 style='color:green'>SUCCESS: Symlink Created!</h2>";
    echo "<p>Images stored in storage/app/public are now visible at /storage/</p>";
} else {
    echo "<h2 style='color:red'>FAILURE: Could not create symlink. Check permissions.</h2>";
}
