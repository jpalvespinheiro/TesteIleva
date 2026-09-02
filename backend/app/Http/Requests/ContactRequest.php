<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ContactType;
use App\Models\Contact;
use Illuminate\Foundation\Http\FormRequest;

abstract class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->exists('value')) {
            return;
        }

        $type = $this->contactType();
        $value = (string) $this->input('value');

        if ($type === ContactType::Email) {
            $this->merge(['value' => strtolower(trim($value))]);

            return;
        }

        if ($type?->requiresPhoneValidation() === true) {
            $phone = preg_replace('/\D/', '', $value) ?? '';
            $this->merge(['value' => strlen($phone) === 11 ? "55{$phone}" : $phone]);
        }
    }

    protected function contactType(): ?ContactType
    {
        $type = ContactType::tryFrom((string) $this->input('type'));

        if ($type) {
            return $type;
        }

        $contact = $this->route('contact');

        return $contact instanceof Contact ? ContactType::tryFrom($contact->typeValue()) : null;
    }
}
