<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ContactType;
use App\Models\Person;
use App\Rules\Phone;
use Illuminate\Validation\Rule;

class StoreContactRequest extends ContactRequest
{
    public function rules(): array
    {
        $type = $this->contactType();
        $person = $this->route('person');
        $personId = $person instanceof Person ? $person->id : null;

        return [
            'type' => ['required', Rule::enum(ContactType::class)],
            'value' => [
                'required',
                'string',
                'max:255',
                Rule::when($type === ContactType::Email, ['email:rfc']),
                Rule::when($type?->requiresPhoneValidation() === true, [new Phone]),
                Rule::unique('contacts', 'value')->where('person_id', $personId),
            ],
        ];
    }
}
