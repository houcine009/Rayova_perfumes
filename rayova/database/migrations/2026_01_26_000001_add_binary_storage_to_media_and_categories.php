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
        Schema::table('product_media', function (Blueprint $table) {
            $table->longText('file_data')->nullable(); // Using longText for base64 storage
            $table->string('mime_type')->nullable();
        });

        // Add binary storage to categories
        Schema::table('categories', function (Blueprint $table) {
            $table->longText('file_data')->nullable();
            $table->string('mime_type')->nullable();
        });
        
        // Change image_url to allow longer values in case we store small base64 directly
        DB::statement('ALTER TABLE categories MODIFY image_url LONGTEXT NULL');
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
