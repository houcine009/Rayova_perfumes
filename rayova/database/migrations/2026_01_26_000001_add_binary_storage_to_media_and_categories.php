<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Safe update for product_media
        try {
            if (!Schema::hasColumn('product_media', 'file_data')) {
                DB::statement('ALTER TABLE product_media ADD file_data LONGTEXT NULL');
            } else {
                DB::statement('ALTER TABLE product_media MODIFY file_data LONGTEXT NULL');
            }
            
            if (!Schema::hasColumn('product_media', 'mime_type')) {
                DB::statement('ALTER TABLE product_media ADD mime_type VARCHAR(255) NULL');
            }

            // Expand URL column for all media
            DB::statement('ALTER TABLE product_media MODIFY url LONGTEXT NULL');
        } catch (\Exception $e) {
            \Log::info('Product Media migration safe-skip: ' . $e->getMessage());
        }

        // 2. Safe update for categories
        try {
            if (!Schema::hasColumn('categories', 'file_data')) {
                DB::statement('ALTER TABLE categories ADD file_data LONGTEXT NULL');
            } else {
                DB::statement('ALTER TABLE categories MODIFY file_data LONGTEXT NULL');
            }
            
            if (!Schema::hasColumn('categories', 'mime_type')) {
                DB::statement('ALTER TABLE categories ADD mime_type VARCHAR(255) NULL');
            }

            // Expand URL column for categories
            DB::statement('ALTER TABLE categories MODIFY image_url LONGTEXT NULL');
        } catch (\Exception $e) {
            \Log::info('Categories migration safe-skip: ' . $e->getMessage());
        }
    }

    public function down(): void
    {
        Schema::table('product_media', function (Blueprint $table) {
            $table->dropColumn(['file_data', 'mime_type']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['file_data', 'mime_type']);
        });
    }
};
