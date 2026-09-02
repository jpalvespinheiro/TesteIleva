<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class Cpf implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match('/^\d{11}$/', $value)) {
            $fail('O campo :attribute deve conter um CPF válido.');

            return;
        }

        if (preg_match('/^(\d)\1{10}$/', $value)) {
            $fail('O campo :attribute deve conter um CPF válido.');

            return;
        }

        for ($position = 9; $position < 11; $position++) {
            $sum = 0;

            for ($index = 0; $index < $position; $index++) {
                $sum += (int) $value[$index] * (($position + 1) - $index);
            }

            $digit = (($sum * 10) % 11) % 10;

            if ($digit !== (int) $value[$position]) {
                $fail('O campo :attribute deve conter um CPF válido.');

                return;
            }
        }
    }
}
