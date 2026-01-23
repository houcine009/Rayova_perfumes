<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductMedia extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'product_media';

    protected $fillable = [
        'product_id',
        'url',
        'alt_text',
        'is_primary',
        'display_order',
        'file_data',
        'mime_type',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'display_order' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function isStoredInDb(): bool
    {
        return !empty($this->file_data);
    }
}
