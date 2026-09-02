<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\ContactType;
use App\Models\Contact;
use App\Models\Person;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

final class ContactApiTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('validContacts')]
    public function test_creates_supported_contact_types(string $type, string $value, string $storedValue): void
    {
        $person = Person::factory()->create();

        $this->postJson("/api/people/{$person->id}/contacts", compact('type', 'value'))
            ->assertCreated()
            ->assertJsonPath('data.person_id', $person->id)
            ->assertJsonPath('data.type', $type)
            ->assertJsonPath('data.value', $storedValue);

        $this->assertDatabaseHas('contacts', [
            'person_id' => $person->id,
            'type' => $type,
            'value' => $storedValue,
        ]);
    }

    #[DataProvider('invalidContacts')]
    public function test_rejects_invalid_contacts(string $type, string $value, string $field): void
    {
        $person = Person::factory()->create();

        $this->postJson("/api/people/{$person->id}/contacts", compact('type', 'value'))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($field);
    }

    public function test_lists_and_shows_a_persons_contacts(): void
    {
        $person = Person::factory()->create();
        $contact = Contact::factory()->for($person)->create([
            'type' => ContactType::Email,
            'value' => 'person@example.com',
        ]);

        $this->getJson("/api/people/{$person->id}/contacts")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.page', 1)
            ->assertJsonPath('pagination.per_page', 10)
            ->assertJsonPath('pagination.total', 1);

        $this->getJson("/api/contacts/{$contact->id}")
            ->assertOk()
            ->assertJsonPath('data.value', 'person@example.com');
    }

    public function test_paginates_a_persons_contacts(): void
    {
        $person = Person::factory()->create();
        Contact::factory()->count(3)->for($person)->create();

        $this->getJson("/api/people/{$person->id}/contacts?page=2&per_page=2")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('pagination.page', 2)
            ->assertJsonPath('pagination.per_page', 2)
            ->assertJsonPath('pagination.last_page', 2)
            ->assertJsonPath('pagination.total', 3);
    }

    public function test_returns_not_found_for_a_missing_contact(): void
    {
        $this->getJson('/api/contacts/999999')->assertNotFound();
    }

    public function test_updates_a_contact(): void
    {
        $person = Person::factory()->create();
        $contact = Contact::factory()->for($person)->create([
            'type' => ContactType::Phone,
            'value' => '+5511999999999',
        ]);

        $this->patchJson(
            "/api/contacts/{$contact->id}",
            ['value' => '+5511988888888'],
        )
            ->assertOk()
            ->assertJsonPath('data.value', '5511988888888');

        $this->assertDatabaseHas('contacts', [
            'id' => $contact->id,
            'value' => '5511988888888',
        ]);
    }

    public function test_rejects_the_same_phone_twice_for_a_person(): void
    {
        $person = Person::factory()->create();

        $this->postJson("/api/people/{$person->id}/contacts", [
            'type' => ContactType::Phone->value,
            'value' => '+55 (11) 93333-4444',
        ])->assertCreated();

        $this->postJson("/api/people/{$person->id}/contacts", [
            'type' => ContactType::Whatsapp->value,
            'value' => '5511933334444',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('value');

        $this->assertDatabaseCount('contacts', 1);
    }

    public function test_allows_the_same_phone_for_different_people(): void
    {
        $firstPerson = Person::factory()->create();
        $secondPerson = Person::factory()->create();
        $contact = ['type' => ContactType::Phone->value, 'value' => '5511933334444'];

        $this->postJson("/api/people/{$firstPerson->id}/contacts", $contact)->assertCreated();
        $this->postJson("/api/people/{$secondPerson->id}/contacts", $contact)->assertCreated();

        $this->assertDatabaseCount('contacts', 2);
    }

    public function test_requires_a_value_when_changing_contact_type(): void
    {
        $person = Person::factory()->create();
        $contact = Contact::factory()->for($person)->create();

        $this->patchJson(
            "/api/contacts/{$contact->id}",
            ['type' => ContactType::Email->value],
        )
            ->assertUnprocessable()
            ->assertJsonValidationErrors('value');
    }

    public function test_deletes_a_contact(): void
    {
        $person = Person::factory()->create();
        $contact = Contact::factory()->for($person)->create();

        $this->deleteJson("/api/contacts/{$contact->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }

    public static function validContacts(): iterable
    {
        yield 'email' => ['email', 'person@example.com', 'person@example.com'];
        yield 'phone' => ['phone', '+55 (11) 93333-4444', '5511933334444'];
        yield 'whatsapp' => ['whatsapp', '+55 (11) 99999-8888', '5511999998888'];
    }

    public static function invalidContacts(): iterable
    {
        yield 'unknown type' => ['fax', '12345678', 'type'];
        yield 'invalid email' => ['email', 'not-an-email', 'value'];
        yield 'invalid phone' => ['phone', 'phone-number', 'value'];
    }
}
