<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ContactType;
use App\Models\Contact;
use App\Rules\Phone;
use Illuminate\Validation\Rule;

class UpdateContactRequest extends ContactRequest
{
    public function rules(): array
    {
        $contact = $this->route('contact');
        $type = $this->contactType();
        $contactId = $contact instanceof Contact ? $contact->id : null;
        $personId = $contact instanceof Contact ? $contact->person_id : null;

        return [
            'type' => ['sometimes', 'required', Rule::enum(ContactType::class)],
            'value' => [
                'required_with:type',
                'string',
                'max:255',
                Rule::when($type === ContactType::Email, ['email:rfc']),
                Rule::when($type?->requiresPhoneValidation() === true, [new Phone]),
                Rule::unique('contacts', 'value')->where('person_id', $personId)->ignore($contactId),
            ],
        ];
    }
}
