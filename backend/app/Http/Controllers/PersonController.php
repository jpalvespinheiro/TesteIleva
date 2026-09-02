<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\People\CreatePersonAction;
use App\Actions\People\DeletePersonAction;
use App\Actions\People\ListPeopleAction;
use App\Actions\People\ShowPersonAction;
use App\Actions\People\UpdatePersonAction;
use App\Http\Requests\IndexPersonRequest;
use App\Http\Requests\StorePersonRequest;
use App\Http\Requests\UpdatePersonRequest;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

final class PersonController extends Controller
{
    public function index(IndexPersonRequest $request, ListPeopleAction $action): JsonResponse
    {
        $people = $action->execute(
            $request->validated('name'),
            $request->validated('cpf'),
            $request->validated('phone'),
            $request->integer('per_page', 10),
        );

        return response()->json([
            'data' => PersonResource::collection($people->items()),
            'pagination' => [
                'page' => $people->currentPage(),
                'per_page' => $people->perPage(),
                'last_page' => $people->lastPage(),
                'total' => $people->total(),
            ],
        ]);
    }

    public function store(StorePersonRequest $request, CreatePersonAction $action): JsonResponse
    {
        $person = $action->execute($request->validated());

        return (new PersonResource($person))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Person $person, ShowPersonAction $action): PersonResource
    {
        return new PersonResource($action->execute($person));
    }

    public function update(UpdatePersonRequest $request, Person $person, UpdatePersonAction $action): PersonResource
    {
        return new PersonResource($action->execute($person, $request->validated()));
    }

    public function destroy(Person $person, DeletePersonAction $action): Response
    {
        $action->execute($person);

        return response()->noContent();
    }
}
