<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add binary storage to product_media
        if (Schema::hasTable('product_media')) {
            Schema::table('product_media', function (Blueprint $table) {
                if (!Schema::hasColumn('product_media', 'file_data')) {
                    $table->longText('file_data')->nullable();
                }
                if (!Schema::hasColumn('product_media', 'mime_type')) {
                    $table->string('mime_type')->nullable();
                }
                
                // Safe modify for url
                try {
                    $table->longText('url')->nullable()->change();
                } catch (\Exception $e) {
                    \Log::info('Product Media URL modify skipped: ' . $e->getMessage());
                }
            });
        }

        // Add binary storage to categories
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                if (!Schema::hasColumn('categories', 'file_data')) {
                    $table->longText('file_data')->nullable();
                }
                if (!Schema::hasColumn('categories', 'mime_type')) {
                    $table->string('mime_type')->nullable();
                }
                
                // Safe modify for image_url
                try {
                    $table->longText('image_url')->nullable()->change();
                } catch (\Exception $e) {
                    \Log::info('Category Image URL modify skipped: ' . $e->getMessage());
                }
            });
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
