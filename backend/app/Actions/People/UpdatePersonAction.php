<?php

declare(strict_types=1);

namespace App\Actions\People;

use App\Models\Person;
use App\Services\ViaCep\ViaCepAddress;
use App\Services\ViaCep\ViaCepService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Throwable;

final class UpdatePersonAction
{
    public function __construct(private readonly ViaCepService $viaCep) {}

    public function execute(Person $person, array $data): Person
    {
        $address = $data['address'] ?? null;
        unset($data['address']);

        $addressData = null;
        $number = null;
        $complement = null;

        if (is_array($address)) {
            $cep = $address['cep'] ?? null;
            $number = $address['number'] ?? null;
            $complement = $address['complement'] ?? null;

            if (! is_string($cep) || ! is_string($number) || (! is_null($complement) && ! is_string($complement))) {
                throw new InvalidArgumentException('Os dados do endereço são inválidos.');
            }

            $addressData = $this->viaCep->find($cep);
        }

        DB::beginTransaction();

        try {
            $person->update($data);

            if ($addressData instanceof ViaCepAddress) {
                $person->address()->updateOrCreate(
                    [],
                    $addressData->toArray($number, $complement),
                );
            }

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();

            throw $exception;
        }

        return $person->refresh()->load('address')->loadCount('contacts');
    }
}
