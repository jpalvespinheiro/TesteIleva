<?php

declare(strict_types=1);

namespace App\Actions\People;

use App\Models\Person;

final class ShowPersonAction
{
    public function execute(Person $person): Person
    {
        return $person
            ->load([
                'address',
                'contacts' => fn ($query) => $query->orderBy('type')->orderBy('value'),
            ])
            ->loadCount('contacts');
    }
}
