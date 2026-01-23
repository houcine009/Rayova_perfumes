<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_media', function (Blueprint $table) {
            // Using binary and then manually changing type to LONGBLOB for MySQL/SQLite compatibility if needed
            $table->binary('file_data')->nullable();
            $table->string('mime_type')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('product_media', function (Blueprint $table) {
            $table->dropColumn(['file_data', 'mime_type']);
        });
    }
};
