<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Services\ViaCep\ViaCepAddress;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

class ViaCepAddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $address = $this->resource;

        if (! $address instanceof ViaCepAddress) {
            throw new LogicException('ViaCepAddressResource requer uma instância de ViaCepAddress.');
        }

        return [
            'cep' => $address->cep,
            'street' => $address->street,
            'neighborhood' => $address->neighborhood,
            'city' => $address->city,
            'state' => $address->state,
        ];
    }
}
