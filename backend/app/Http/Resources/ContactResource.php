<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use LogicException;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $contact = $this->resource;

        if (! $contact instanceof Contact) {
            throw new LogicException('ContactResource requer uma instância de Contact.');
        }

        return [
            'id' => $contact->id,
            'person_id' => $contact->person_id,
            'type' => $contact->typeValue(),
            'value' => $contact->value,
            'created_at' => $contact->created_at?->toISOString(),
            'updated_at' => $contact->updated_at?->toISOString(),
        ];
    }
}
