<?php

declare(strict_types=1);

namespace App\Actions\Contacts;

use App\Models\Contact;

class UpdateContactAction
{
    public function execute(Contact $contact, array $data): Contact
    {
        $contact->update($data);

        return $contact->refresh();
    }
}
