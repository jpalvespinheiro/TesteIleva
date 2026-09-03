<?php

declare(strict_types=1);

namespace App\Actions\Contacts;

use App\Models\Person;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListContactsAction
{
    public function execute(Person $person, int $perPage): LengthAwarePaginator
    {
        return $person->contacts()
            ->orderBy('type')
            ->orderBy('value')
            ->paginate($perPage);
    }
}
