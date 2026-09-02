<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class Phone implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match('/^\+?[0-9\s().-]+$/', $value)) {
            $fail('O campo :attribute deve conter um celular brasileiro válido.');

            return;
        }

        $phone = preg_replace('/\D/', '', $value) ?? '';

        if (strlen($phone) === 11) {
            $phone = "55{$phone}";
        }

        if (! preg_match('/^55[1-9][0-9]9[0-9]{8}$/', $phone)) {
            $fail('O campo :attribute deve conter um celular brasileiro válido.');
        }
    }
}
