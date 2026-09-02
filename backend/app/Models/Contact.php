<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ContactType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'type' => ContactType::class,
        ];
    }

    public function typeValue(): string
    {
        $type = $this->getAttribute('type');

        return $type instanceof ContactType ? $type->value : (string) $type;
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
