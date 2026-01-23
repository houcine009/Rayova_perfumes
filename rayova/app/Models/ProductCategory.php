<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductCategory extends Pivot
{
    use HasUuids;

    protected $table = 'product_categories';
    protected $primaryKey = 'id';
    
    public $incrementing = false;
    protected $keyType = 'string';
}
