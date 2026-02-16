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
        Schema::table('products', function (Blueprint $table) {
            $existingIndexes = collect(Illuminate\Support\Facades\DB::select("SHOW INDEXES FROM products"))->pluck('Key_name');

            if (!$existingIndexes->contains('products_is_active_index')) {
                $table->index('is_active');
            }
            if (!$existingIndexes->contains('products_is_featured_index')) {
                $table->index('is_featured');
            }
            if (!$existingIndexes->contains('products_gender_index')) {
                $table->index('gender');
            }
            if (!$existingIndexes->contains('products_created_at_index')) {
                $table->index('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['gender']);
            $table->dropIndex(['created_at']);
        });
    }
};
