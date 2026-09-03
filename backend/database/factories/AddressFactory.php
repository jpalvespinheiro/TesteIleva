<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    public function definition(): array
    {
        $address = fake()->randomElement([
            ['01001000', 'Praça da Sé', 'Sé', 'São Paulo', 'SP'],
            ['20040002', 'Rua São José', 'Centro', 'Rio de Janeiro', 'RJ'],
            ['30140071', 'Avenida Afonso Pena', 'Centro', 'Belo Horizonte', 'MG'],
            ['70040900', 'Praça dos Três Poderes', 'Zona Cívico-Administrativa', 'Brasília', 'DF'],
            ['80010000', 'Rua José Loureiro', 'Centro', 'Curitiba', 'PR'],
            ['90010000', 'Praça Marechal Deodoro', 'Centro Histórico', 'Porto Alegre', 'RS'],
        ]);

        return [
            'person_id' => Person::factory(),
            'cep' => $address[0],
            'street' => $address[1],
            'number' => (string) fake()->numberBetween(1, 2000),
            'complement' => fake()->optional()->randomElement(['Apto 12', 'Casa 2', 'Bloco B']),
            'neighborhood' => $address[2],
            'city' => $address[3],
            'state' => $address[4],
        ];
    }
}
