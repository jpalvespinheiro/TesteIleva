<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PersonFactory extends Factory
{
    public function definition(): array
    {
        $areaCode = fake()->randomElement([11, 21, 31, 41, 51, 61, 71, 81]);

        return [
            'name' => fake()->name(),
            'cpf' => $this->cpf(),
            'phone' => sprintf('55%d9%08d', $areaCode, fake()->numberBetween(0, 99999999)),
        ];
    }

    private function cpf(): string
    {
        do {
            $cpf = fake()->unique()->numerify('#########');
        } while (preg_match('/^(\d)\1{8}$/', $cpf));

        for ($position = 9; $position < 11; $position++) {
            $sum = 0;

            for ($index = 0; $index < $position; $index++) {
                $sum += (int) $cpf[$index] * (($position + 1) - $index);
            }

            $cpf .= (string) ((($sum * 10) % 11) % 10);
        }

        return $cpf;
    }
}
