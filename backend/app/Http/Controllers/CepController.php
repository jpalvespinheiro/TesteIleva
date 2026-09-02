<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LookupCepRequest;
use App\Http\Resources\ViaCepAddressResource;
use App\Services\ViaCep\ViaCepService;
use Illuminate\Http\JsonResponse;

final class CepController extends Controller
{
    public function show(LookupCepRequest $request, ViaCepService $viaCep): JsonResponse
    {
        $cep = $request->validated('cep');
        $address = $viaCep->find(is_string($cep) ? $cep : '');

        return (new ViaCepAddressResource($address))->response();
    }
}
