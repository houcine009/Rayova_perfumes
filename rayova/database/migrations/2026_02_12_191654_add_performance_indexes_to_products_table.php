<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            try { $table->index('is_active'); } catch (\Exception $e) {}
            try { $table->index('is_featured'); } catch (\Exception $e) {}
            try { $table->index('gender'); } catch (\Exception $e) {}
            try { $table->index('created_at'); } catch (\Exception $e) {}
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
