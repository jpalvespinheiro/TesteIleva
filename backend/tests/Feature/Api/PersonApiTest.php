<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Address;
use App\Models\Contact;
use App\Models\Person;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PersonApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_people_with_pagination_and_filters(): void
    {
        $ana = Person::factory()->create([
            'name' => 'Ana Souza',
            'cpf' => '52998224725',
            'phone' => '5511999991111',
        ]);
        Person::factory()->create([
            'name' => 'Bruno Lima',
            'cpf' => '11144477735',
            'phone' => '5511999992222',
        ]);
        Contact::factory()->for($ana)->create(['value' => '5521988887777']);

        $this->getJson('/api/people?name=ana&cpf=529.982&phone=(21)%2098888-7777&page=1&per_page=10')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Ana Souza')
            ->assertJsonPath('pagination.page', 1)
            ->assertJsonPath('pagination.per_page', 10)
            ->assertJsonPath('pagination.last_page', 1)
            ->assertJsonPath('pagination.total', 1)
            ->assertJsonMissingPath('meta')
            ->assertJsonMissingPath('links');
    }

    public function test_validates_pagination_parameters(): void
    {
        $this->getJson('/api/people?page=0&per_page=101')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['page', 'per_page']);
    }

    public function test_creates_a_person(): void
    {
        Http::fake([
            'viacep.com.br/ws/*' => Http::response($this->viaCepAddress()),
        ]);

        $this->postJson('/api/people', $this->validPersonData())
            ->assertCreated()
            ->assertJsonPath('data.name', 'Maria Silva')
            ->assertJsonPath('data.cpf', '52998224725')
            ->assertJsonPath('data.phone', '5511999998888')
            ->assertJsonPath('data.address.city', 'São Paulo')
            ->assertJsonPath('data.address.state', 'SP');

        $this->assertDatabaseHas('people', [
            'name' => 'Maria Silva',
            'cpf' => '52998224725',
            'phone' => '5511999998888',
        ]);
        $this->assertDatabaseHas('addresses', [
            'cep' => '01001000',
            'street' => 'Praça da Sé',
            'number' => '100',
            'city' => 'São Paulo',
            'state' => 'SP',
        ]);
    }

    public function test_rejects_an_invalid_person(): void
    {
        $this->postJson('/api/people', ['name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name')
            ->assertJsonPath('message', 'O campo nome completo é obrigatório. (e mais 5 erros)');
    }

    public function test_rejects_invalid_cpf_and_phone(): void
    {
        $data = $this->validPersonData();
        $data['cpf'] = '111.111.111-11';
        $data['phone'] = '(11) 3333-4444';

        $this->postJson('/api/people', $data)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cpf', 'phone']);
    }

    public function test_rejects_a_duplicate_cpf(): void
    {
        Http::fake([
            'viacep.com.br/ws/*' => Http::response($this->viaCepAddress()),
        ]);

        $this->postJson('/api/people', $this->validPersonData())->assertCreated();

        $duplicate = $this->validPersonData();
        $duplicate['name'] = 'Outra Pessoa';

        $this->postJson('/api/people', $duplicate)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cpf')
            ->assertJsonPath('message', 'O CPF informado já está cadastrado.')
            ->assertJsonPath('errors.cpf.0', 'O CPF informado já está cadastrado.');

        $this->assertDatabaseCount('people', 1);
    }

    public function test_rejects_a_cep_not_found_by_viacep(): void
    {
        Http::fake([
            'viacep.com.br/ws/*' => Http::response(['erro' => true]),
        ]);

        $this->postJson('/api/people', $this->validPersonData())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('address.cep');

        $this->assertDatabaseCount('people', 0);
    }

    public function test_returns_service_unavailable_when_viacep_fails(): void
    {
        Http::fake([
            'viacep.com.br/ws/*' => Http::response([], 500),
        ]);

        $this->postJson('/api/people', $this->validPersonData())
            ->assertServiceUnavailable();

        $this->assertDatabaseCount('people', 0);
    }

    public function test_shows_a_person_with_contacts(): void
    {
        $person = Person::factory()->create();
        Contact::factory()->count(2)->for($person)->create();

        $this->getJson("/api/people/{$person->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $person->id)
            ->assertJsonPath('data.contacts_count', 2)
            ->assertJsonCount(2, 'data.contacts');
    }

    public function test_updates_a_person(): void
    {
        $person = Person::factory()->create(['name' => 'Old Name']);

        $this->patchJson("/api/people/{$person->id}", ['name' => 'New Name'])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name');

        $this->assertDatabaseHas('people', ['id' => $person->id, 'name' => 'New Name']);
    }

    public function test_updates_a_person_address_using_viacep(): void
    {
        $person = Person::factory()->create();
        Address::factory()->for($person)->create();
        Http::fake([
            'viacep.com.br/ws/*' => Http::response([
                'logradouro' => 'Avenida Afonso Pena',
                'bairro' => 'Centro',
                'localidade' => 'Belo Horizonte',
                'uf' => 'MG',
            ]),
        ]);

        $this->patchJson("/api/people/{$person->id}", [
            'address' => [
                'cep' => '30140-071',
                'number' => '500',
                'complement' => 'Sala 10',
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.address.cep', '30140071')
            ->assertJsonPath('data.address.city', 'Belo Horizonte');

        $this->assertDatabaseHas('addresses', [
            'person_id' => $person->id,
            'cep' => '30140071',
            'number' => '500',
            'city' => 'Belo Horizonte',
            'state' => 'MG',
        ]);
    }

    public function test_deletes_a_person_and_their_contacts(): void
    {
        $person = Person::factory()->create();
        $address = Address::factory()->for($person)->create();
        $contact = Contact::factory()->for($person)->create();

        $this->deleteJson("/api/people/{$person->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('people', ['id' => $person->id]);
        $this->assertDatabaseMissing('addresses', ['id' => $address->id]);
        $this->assertDatabaseMissing('contacts', ['id' => $contact->id]);
    }

    private function validPersonData(): array
    {
        return [
            'name' => 'Maria Silva',
            'cpf' => '529.982.247-25',
            'phone' => '(11) 99999-8888',
            'address' => [
                'cep' => '01001-000',
                'number' => '100',
                'complement' => 'Apto 12',
            ],
        ];
    }

    private function viaCepAddress(): array
    {
        return [
            'cep' => '01001-000',
            'logradouro' => 'Praça da Sé',
            'bairro' => 'Sé',
            'localidade' => 'São Paulo',
            'uf' => 'SP',
        ];
    }
}
