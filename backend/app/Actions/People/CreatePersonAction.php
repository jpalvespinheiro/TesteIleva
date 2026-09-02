<?php

declare(strict_types=1);

namespace App\Actions\People;

use App\Models\Person;
use App\Services\ViaCep\ViaCepService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

final class CreatePersonAction
{
    public function __construct(private readonly ViaCepService $viaCep) {}

    public function execute(array $data): Person
    {
        $address = $data['address'] ?? null;

        if (! is_array($address)) {
            throw new InvalidArgumentException('Os dados do endereço são obrigatórios.');
        }

        $cep = $address['cep'] ?? null;
        $number = $address['number'] ?? null;
        $complement = $address['complement'] ?? null;

        if (! is_string($cep) || ! is_string($number) || (! is_null($complement) && ! is_string($complement))) {
            throw new InvalidArgumentException('Os dados do endereço são inválidos.');
        }

        $addressData = $this->viaCep->find($cep);
        $personData = Arr::only($data, ['name', 'cpf', 'phone']);

        DB::beginTransaction();

        try {
            $person = Person::query()->create($personData);
            $person->address()->create($addressData->toArray($number, $complement));
            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }

        return $person->load('address');
    }
}
