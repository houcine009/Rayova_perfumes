<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'houcinezaghmane@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Houcine33@'),
                'role' => 'super_admin',
            ]
        );
    }
}
