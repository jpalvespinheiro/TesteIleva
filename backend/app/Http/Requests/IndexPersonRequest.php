<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IndexPersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'cpf' => ['sometimes', 'nullable', 'string', 'max:11'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:13'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'between:1,100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->filled('name') ? trim((string) $this->input('name')) : null,
            'cpf' => $this->digits('cpf'),
            'phone' => $this->digits('phone'),
        ]);
    }

    private function digits(string $field): ?string
    {
        if (! $this->filled($field)) {
            return null;
        }

        return preg_replace('/\D/', '', (string) $this->input($field)) ?: null;
    }
}
