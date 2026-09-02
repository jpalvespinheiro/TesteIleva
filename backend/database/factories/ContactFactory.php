<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ContactType;
use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

final class ContactFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(ContactType::cases());

        return [
            'person_id' => Person::factory(),
            'type' => $type,
            'value' => match ($type) {
                ContactType::Email => fake()->safeEmail(),
                ContactType::Phone, ContactType::Whatsapp => sprintf(
                    '+55%d9%08d',
                    fake()->randomElement([11, 21, 31, 41, 51, 61, 71, 81]),
                    fake()->numberBetween(0, 99999999),
                ),
            },
        ];
    }
}
