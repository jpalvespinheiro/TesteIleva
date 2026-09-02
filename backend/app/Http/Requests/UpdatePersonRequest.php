<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Person;
use App\Rules\Cpf;
use App\Rules\Phone;
use Illuminate\Validation\Rule;

final class UpdatePersonRequest extends PersonRequest
{
    public function rules(): array
    {
        $person = $this->route('person');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'cpf' => [
                'sometimes',
                'required',
                'regex:/^\d{11}$/',
                new Cpf,
                Rule::unique('people', 'cpf')->ignore($person instanceof Person ? $person->id : null),
            ],
            'phone' => ['sometimes', 'required', new Phone],
            'address' => ['sometimes', 'required', 'array'],
            'address.cep' => ['required_with:address', 'regex:/^\d{8}$/'],
            'address.number' => ['required_with:address', 'string', 'max:20'],
            'address.complement' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
