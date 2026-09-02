<?php

declare(strict_types=1);

namespace App\Services\ViaCep;

final readonly class ViaCepAddress
{
    public function __construct(public string $cep, public ?string $street, public ?string $neighborhood, public string $city, public string $state) {}

    public function toArray(string $number, ?string $complement): array
    {
        return [
            'cep' => $this->cep,
            'street' => $this->street,
            'number' => $number,
            'complement' => $complement,
            'neighborhood' => $this->neighborhood,
            'city' => $this->city,
            'state' => $this->state,
        ];
    }
}
