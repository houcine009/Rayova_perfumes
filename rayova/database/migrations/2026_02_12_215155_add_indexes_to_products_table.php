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
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes('products');

            if (!array_key_exists('products_is_active_index', $indexes)) {
                $table->index('is_active');
            }
            if (!array_key_exists('products_is_featured_index', $indexes)) {
                $table->index('is_featured');
            }
            if (!array_key_exists('products_gender_index', $indexes)) {
                $table->index('gender');
            }
            if (!array_key_exists('products_created_at_index', $indexes)) {
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
