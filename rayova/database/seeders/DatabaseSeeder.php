<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Profile;
use App\Models\SiteSetting;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create super admin user
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'houcinezaghmane@gmail.com',
            'password' => Hash::make('Houcine33@'),
            'role' => 'super_admin',
            'email_verified_at' => now(),
        ]);

        Profile::create([
            'user_id' => $superAdmin->id,
            'first_name' => 'Super',
            'last_name' => 'Admin',
        ]);

        // Create default categories
        $nicheCat = Category::create([
            'name' => 'Niche',
            'slug' => 'niche',
            'description' => 'Parfums de niche exclusifs',
            'display_order' => 1,
            'is_active' => true,
        ]);

        $hommeCat = Category::create([
            'name' => 'Homme',
            'slug' => 'homme',
            'description' => 'Collection pour hommes',
            'display_order' => 2,
            'is_active' => true,
        ]);

        $femmeCat = Category::create([
            'name' => 'Femme',
            'slug' => 'femme',
            'description' => 'Collection pour femmes',
            'display_order' => 3,
            'is_active' => true,
        ]);

        // Create demo products
        Product::create([
            'name' => 'Oud Royal',
            'slug' => 'oud-royal',
            'description' => 'Un mélange majestueux de bois de oud et de roses précieuses. Une expérience olfactive unique pour les amateurs de parfums orientaux.',
            'price' => 1200,
            'gender' => 'unisexe',
            'is_featured' => true,
            'notes_top' => 'Safran, Framboise',
            'notes_heart' => 'Rose de Damas, Oud',
            'notes_base' => 'Ambre, Musc',
            'brand' => 'Rayova',
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Lumière d\'Or',
            'slug' => 'lumiere-dor',
            'description' => 'Une fragrance florale éclatante pour la femme moderne. Élégance et fraîcheur en flacon.',
            'price' => 850,
            'gender' => 'femme',
            'is_featured' => true,
            'notes_top' => 'Bergamote, Mandarine',
            'notes_heart' => 'Jasmin, Fleur d\'oranger',
            'notes_base' => 'Vanille, Bois de santal',
            'brand' => 'Rayova',
            'is_active' => true,
        ]);

        Product::create([
            'name' => 'Nuit Sombre',
            'slug' => 'nuit-sombre',
            'description' => 'Un parfum boisé intense et mystérieux pour homme. Destiné à ceux qui osent.',
            'price' => 950,
            'gender' => 'homme',
            'is_featured' => true,
            'notes_top' => 'Poivre noir, Cardamome',
            'notes_heart' => 'Cuir, Cèdre',
            'notes_base' => 'Patchouli, Vétiver',
            'brand' => 'Rayova',
            'is_active' => true,
        ]);

        // Create default site settings if they don't exist
        SiteSetting::updateOrCreate(
            ['key' => 'hero'],
            [
                'value' => [
                    'title' => 'Rayova',
                    'subtitle' => "L'Art du Parfum",
                    'cta_primary' => 'Découvrir',
                    'cta_secondary' => 'Acheter',
                    'video_url' => null,
                    'image_url' => null,
                ],
            ]
        );

        SiteSetting::updateOrCreate(
            ['key' => 'contact'],
            [
                'value' => [
                    'email' => 'contact@rayova.ma',
                    'phone' => '+212 5XX-XXXXXX',
                    'address' => 'Casablanca, Maroc',
                    'whatsapp' => '+212 6XX-XXXXXX',
                ],
            ]
        );

        SiteSetting::updateOrCreate(
            ['key' => 'social'],
            [
                'value' => [
                    'facebook' => 'https://facebook.com/rayova',
                    'instagram' => 'https://instagram.com/rayova',
                    'twitter' => null,
                    'tiktok' => null,
                ],
            ]
        );

        $this->command->info('✅ Database seeded successfully!');
    }
}
