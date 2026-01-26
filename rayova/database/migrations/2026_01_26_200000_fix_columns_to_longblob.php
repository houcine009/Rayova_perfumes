<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Explicitly set to LONGBLOB to handle large binary files (up to 4GB)
        // LONGTEXT might truncate binary data due to encoding checks
        try {
            DB::statement('ALTER TABLE product_media MODIFY file_data LONGBLOB');
            DB::statement('ALTER TABLE categories MODIFY file_data LONGBLOB');
        } catch (\Exception $e) {
            // Log but don't fail if table doesn't exist (though it should)
            \Log::warning('Fix LONGBLOB migration issue: ' . $e->getMessage());
        }
    }

    public function down(): void
    {
        // Revert to LONGTEXT if needed, though unlikely
        try {
            DB::statement('ALTER TABLE product_media MODIFY file_data LONGTEXT NULL');
            DB::statement('ALTER TABLE categories MODIFY file_data LONGTEXT NULL');
        } catch (\Exception $e) {
        }
    }
};
