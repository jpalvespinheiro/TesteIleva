<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

final class PersonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $person = $this->resource;

        if (! $person instanceof Person) {
            throw new LogicException('PersonResource requer uma instância de Person.');
        }

        return [
            'id' => $person->id,
            'name' => $person->name,
            'cpf' => $person->cpf,
            'phone' => $person->phone,
            'address' => new AddressResource($this->whenLoaded('address')),
            'contacts_count' => $this->whenCounted('contacts'),
            'contacts' => ContactResource::collection($this->whenLoaded('contacts')),
            'created_at' => $person->created_at?->toISOString(),
            'updated_at' => $person->updated_at?->toISOString(),
        ];
    }
}
