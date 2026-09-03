<?php

declare(strict_types=1);

namespace App\Actions\People;

use App\Models\Person;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListPeopleAction
{
    public function execute(?string $name, ?string $cpf, ?string $phone, int $perPage): LengthAwarePaginator
    {
        return Person::query()
            ->with('address')
            ->withCount('contacts')
            ->when(
                $name,
                fn ($query, string $name) => $query->whereLike('name', "%{$name}%", caseSensitive: false),
            )
            ->when($cpf, fn ($query, string $cpf) => $query->where('cpf', 'like', "%{$cpf}%"))
            ->when($phone, fn ($query, string $phone) => $query->where(
                fn ($query) => $query
                    ->where('phone', 'like', "%{$phone}%")
                    ->orWhereHas('contacts', fn ($query) => $query->where('value', 'like', "%{$phone}%")),
            ))
            ->orderBy('name')
            ->paginate($perPage);
    }
}
