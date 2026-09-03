<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use Tests\TestCase;

final class DocumentationTest extends TestCase
{
    public function test_documentation_is_available(): void
    {
        $this->get('/docs/api')->assertOk();
    }

    public function test_documentation_contains_the_api_routes(): void
    {
        $document = $this->getJson('/docs/api.json')
            ->assertOk()
            ->json();

        $this->assertArrayHasKey('/people', $document['paths']);
        $this->assertArrayHasKey('/people/{person}', $document['paths']);
        $this->assertArrayHasKey('/people/{person}/contacts', $document['paths']);
        $this->assertArrayHasKey('/contacts/{contact}', $document['paths']);
    }

    public function test_documentation_uses_forwarded_https_scheme(): void
    {
        $this->withHeaders([
            'X-Forwarded-Host' => 'testeileva.onrender.com',
            'X-Forwarded-Port' => '443',
            'X-Forwarded-Proto' => 'https',
        ])
            ->getJson('/docs/api.json')
            ->assertOk()
            ->assertJsonPath('servers.0.url', 'https://testeileva.onrender.com/api');
    }
}
