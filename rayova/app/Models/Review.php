<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'is_approved',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_approved', false);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($review) {
            $review->syncProductStats();
        });

        static::deleted(function ($review) {
            $review->syncProductStats();
        });
    }

    /**
     * Recalculate and sync product rating and review count.
     */
    public function syncProductStats()
    {
        $product = $this->product;
        if (!$product) return;

        $stats = self::where('product_id', $this->product_id)
            ->where('is_approved', true)
            ->selectRaw('COUNT(*) as count, AVG(rating) as average')
            ->first();

        $product->update([
            'reviews_count' => $stats->count ?? 0,
            'rating' => round($stats->average ?? 5.0, 1),
        ]);
    }
}
