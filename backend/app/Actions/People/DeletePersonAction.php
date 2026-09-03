<?php

declare(strict_types=1);

namespace App\Actions\People;

use App\Models\Person;

class DeletePersonAction
{
    public function execute(Person $person): void
    {
        $person->delete();
    }
}
