<?php

declare(strict_types=1);

namespace App\Challenge;

final class BracketsValidator
{
    private const array OPENING_BRACKETS = ['(', '[', '{'];

    private const array PAIRS = [
        ')' => '(',
        ']' => '[',
        '}' => '{',
    ];

    public function isValid(string $input): bool
    {
        $stack = [];

        foreach (str_split($input) as $bracket) {
            if (in_array($bracket, self::OPENING_BRACKETS, true)) {
                $stack[] = $bracket;

                continue;
            }

            if (! isset(self::PAIRS[$bracket])) {
                return false;
            }

            if (array_pop($stack) !== self::PAIRS[$bracket]) {
                return false;
            }
        }

        return $stack === [];
    }
}
