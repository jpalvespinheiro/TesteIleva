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
}
