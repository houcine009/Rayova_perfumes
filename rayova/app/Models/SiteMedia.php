<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SiteMedia extends Model
{
    use HasUuids;

    protected $table = 'site_media';

    protected $fillable = [
        'key',
        'file_data',
        'mime_type',
        'filename',
    ];

    public function isStoredInDb(): bool
    {
        return !empty($this->file_data);
    }
}
