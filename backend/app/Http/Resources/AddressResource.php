<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

final class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $address = $this->resource;

        if (! $address instanceof Address) {
            throw new LogicException('AddressResource requer uma instância de Address.');
        }

        return [
            'cep' => $address->cep,
            'street' => $address->street,
            'number' => $address->number,
            'complement' => $address->complement,
            'neighborhood' => $address->neighborhood,
            'city' => $address->city,
            'state' => $address->state,
        ];
    }
}
