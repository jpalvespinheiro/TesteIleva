<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ContactType;
use App\Models\Person;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DatabaseUniqueConstraintTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_prevents_duplicate_cpfs(): void
    {
        $person = Person::factory()->make();
        Person::query()->create($person->getAttributes());

        $this->expectException(UniqueConstraintViolationException::class);

        Person::query()->create([...$person->getAttributes(), 'name' => 'Outra Pessoa']);
    }

    public function test_database_prevents_duplicate_contacts_for_the_same_person(): void
    {
        $person = Person::factory()->create();
        $contact = [
            'type' => ContactType::Phone,
            'value' => '5511999998888',
        ];
        $person->contacts()->create($contact);

        $this->expectException(UniqueConstraintViolationException::class);

        $person->contacts()->create([...$contact, 'type' => ContactType::Whatsapp]);
    }
}
