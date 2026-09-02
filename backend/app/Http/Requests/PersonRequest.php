<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class PersonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];

        if ($this->exists('cpf')) {
            $normalized['cpf'] = $this->digits($this->input('cpf'));
        }

        if ($this->exists('phone')) {
            $phone = $this->digits($this->input('phone'));
            $normalized['phone'] = strlen($phone) === 11 ? "55{$phone}" : $phone;
        }

        $address = $this->input('address');

        if (is_array($address) && array_key_exists('cep', $address)) {
            $address['cep'] = $this->digits($address['cep']);
            $normalized['address'] = $address;
        }

        $this->merge($normalized);
    }

    private function digits(mixed $value): string
    {
        return preg_replace('/\D/', '', (string) $value) ?? '';
    }
}
