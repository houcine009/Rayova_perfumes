<?php

use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'houcinezaghmane@gmail.com';
$password = 'Houcine33@';

$user = User::where('email', $email)->first();

if ($user) {
    $user->update([
        'password' => Hash::make($password),
        'role' => 'super_admin',
    ]);
    echo "User updated successfully.\n";
} else {
    $user = User::create([
        'name' => 'Houcine Zaghmane',
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'super_admin',
    ]);
    
    Profile::create([
        'user_id' => $user->id,
        'first_name' => 'Houcine',
        'last_name' => 'Zaghmane',
    ]);
    echo "User created successfully.\n";
}
