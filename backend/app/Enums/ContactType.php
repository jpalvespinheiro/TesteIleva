<?php

declare(strict_types=1);

namespace App\Enums;

enum ContactType: string
{
    case Email = 'email';
    case Phone = 'phone';
    case Whatsapp = 'whatsapp';

    public function requiresPhoneValidation(): bool
    {
        return $this === self::Phone || $this === self::Whatsapp;
    }
}
