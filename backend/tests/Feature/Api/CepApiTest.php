<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CepApiTest extends TestCase
{
    public function test_returns_an_address_from_viacep(): void
    {
        Http::fake([
            'viacep.com.br/ws/*' => Http::response([
                'logradouro' => 'Praça da Sé',
                'bairro' => 'Sé',
                'localidade' => 'São Paulo',
                'uf' => 'SP',
            ]),
        ]);

        $this->getJson('/api/cep/01001-000')
            ->assertOk()
            ->assertJsonPath('data.cep', '01001000')
            ->assertJsonPath('data.street', 'Praça da Sé')
            ->assertJsonPath('data.city', 'São Paulo')
            ->assertJsonPath('data.state', 'SP');
    }

    public function test_rejects_an_invalid_cep_format(): void
    {
        Http::preventStrayRequests();

        $this->getJson('/api/cep/123')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cep');
    }

    public function test_rejects_a_cep_not_found(): void
    {
        Http::fake([
            'viacep.com.br/ws/*' => Http::response(['erro' => true]),
        ]);

        $this->getJson('/api/cep/00000-000')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('cep');
    }
}
