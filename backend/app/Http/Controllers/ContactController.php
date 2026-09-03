<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Contacts\CreateContactAction;
use App\Actions\Contacts\DeleteContactAction;
use App\Actions\Contacts\ListContactsAction;
use App\Actions\Contacts\UpdateContactAction;
use App\Http\Requests\IndexContactRequest;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ContactController
{
    public function index(IndexContactRequest $request, Person $person, ListContactsAction $action): JsonResponse
    {
        $contacts = $action->execute($person, $request->integer('per_page', 10));

        return response()->json([
            'data' => ContactResource::collection($contacts->items()),
            'pagination' => [
                'page' => $contacts->currentPage(),
                'per_page' => $contacts->perPage(),
                'last_page' => $contacts->lastPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }

    public function store(StoreContactRequest $request, Person $person, CreateContactAction $action): JsonResponse
    {
        $contact = $action->execute($person, $request->validated());

        return (new ContactResource($contact))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Contact $contact): ContactResource
    {
        return new ContactResource($contact);
    }

    public function update(UpdateContactRequest $request, Contact $contact, UpdateContactAction $action): ContactResource
    {
        return new ContactResource($action->execute($contact, $request->validated()));
    }

    public function destroy(Contact $contact, DeleteContactAction $action): Response
    {
        $action->execute($contact);

        return response()->noContent();
    }
}
