<?php

declare(strict_types=1);

namespace App\Challenge;

class BracketsValidator
{
    public function isValid(string $input): bool
    {
        $pairs = [')' => '(', ']' => '[', '}' => '{'];
        $stack = [];

        foreach (str_split($input) as $bracket) {
            if (in_array($bracket, $pairs, true)) {
                $stack[] = $bracket;

                continue;
            }

            if (! isset($pairs[$bracket])) {
                return false;
            }

            if (array_pop($stack) !== $pairs[$bracket]) {
                return false;
            }
        }

        return $stack === [];
    }
}
