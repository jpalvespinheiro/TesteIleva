<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Rules\Cpf;
use App\Rules\Phone;
use Illuminate\Validation\Rule;

final class StorePersonRequest extends PersonRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'cpf' => ['required', 'regex:/^\d{11}$/', new Cpf, Rule::unique('people', 'cpf')],
            'phone' => ['required', new Phone],
            'address' => ['required', 'array'],
            'address.cep' => ['required', 'regex:/^\d{8}$/'],
            'address.number' => ['required', 'string', 'max:20'],
            'address.complement' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
