<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ForceAddPhoneToNewsletterTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('newsletter_subscribers', 'phone')) {
            Schema::table('newsletter_subscribers', function (Blueprint $table) {
                $table->string('phone')->nullable()->after('email');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('newsletter_subscribers', 'phone')) {
            Schema::table('newsletter_subscribers', function (Blueprint $table) {
                $table->dropColumn('phone');
            });
        }
    }
};
