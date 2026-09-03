<?php

use App\Exceptions\ViaCepException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ViaCepException $exception, Request $request): JsonResponse {
            if ($exception->isCepNotFound()) {
                return response()->json([
                    'message' => $exception->getMessage(),
                    'errors' => [
                        $request->routeIs('cep.show') ? 'cep' : 'address.cep' => [$exception->getMessage()],
                    ],
                ], 422);
            }

            return response()->json([
                'message' => $exception->getMessage(),
            ], 503);
        });
        $exceptions->render(function (UniqueConstraintViolationException $exception): mixed {
            if ($exception->index === 'people_cpf_unique' || $exception->columns === ['cpf']) {
                return response()->json([
                    'message' => 'O CPF informado já está cadastrado.',
                    'errors' => ['cpf' => ['O CPF informado já está cadastrado.']],
                ], 422);
            }

            if ($exception->index === 'contacts_person_id_value_unique' || $exception->columns === ['person_id', 'value']) {
                return response()->json([
                    'message' => 'Este contato já está cadastrado para a pessoa.',
                    'errors' => ['value' => ['Este contato já está cadastrado para a pessoa.']],
                ], 422);
            }

            return null;
        });
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
