<?php

declare(strict_types=1);

namespace App\Actions\Contacts;

use App\Models\Contact;
use App\Models\Person;

class CreateContactAction
{
    public function execute(Person $person, array $data): Contact
    {
        $contact = new Contact($data);
        $person->contacts()->save($contact);

        return $contact;
    }
}
