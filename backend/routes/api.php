<?php

use App\Http\Controllers\CepController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PersonController;
use Illuminate\Support\Facades\Route;

Route::scopeBindings()->group(function (): void {
    Route::get('cep/{cep}', [CepController::class, 'show'])->name('cep.show');
    Route::apiResource('people', PersonController::class);
    Route::apiResource('people.contacts', ContactController::class)->shallow();
});
