<?php

declare(strict_types=1);

namespace App\Services\ViaCep;

use App\Exceptions\ViaCepException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use LogicException;

class ViaCepService
{
    public function find(string $cep): ViaCepAddress
    {
        $baseUrl = config('services.viacep.url');

        if (! is_string($baseUrl)) {
            throw new LogicException('A URL do ViaCEP não está configurada.');
        }

        try {
            $response = Http::baseUrl($baseUrl)
                ->acceptJson()
                ->timeout(5)
                ->get("{$cep}/json/")
                ->throw();
        } catch (ConnectionException|RequestException $exception) {
            throw ViaCepException::unavailable(previous: $exception);
        }

        $data = $response->json();

        if (! is_array($data) || filter_var($data['erro'] ?? false, FILTER_VALIDATE_BOOL)) {
            throw ViaCepException::notFound();
        }

        $city = $this->requiredString($data['localidade'] ?? null);
        $state = $this->requiredString($data['uf'] ?? null);

        if ($city === '' || ! preg_match('/^[A-Z]{2}$/', $state)) {
            throw ViaCepException::unavailable('O ViaCEP retornou um endereço incompleto.');
        }

        return new ViaCepAddress(
            cep: $cep,
            street: $this->nullableString($data['logradouro'] ?? null),
            neighborhood: $this->nullableString($data['bairro'] ?? null),
            city: $city,
            state: $state,
        );
    }

    private function requiredString(mixed $value): string
    {
        return is_string($value) ? trim($value) : '';
    }

    private function nullableString(mixed $value): ?string
    {
        $value = $this->requiredString($value);

        return $value === '' ? null : $value;
    }
}
