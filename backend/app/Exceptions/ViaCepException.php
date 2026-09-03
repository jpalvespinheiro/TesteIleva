<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;
use Throwable;

final class ViaCepException extends RuntimeException
{
    private function __construct(string $message, private readonly bool $cepNotFound, ?Throwable $previous = null)
    {
        parent::__construct($message, previous: $previous);
    }

    public static function notFound(): self
    {
        return new self('CEP não encontrado.', true);
    }

    public static function unavailable(string $message = 'Não foi possível consultar o ViaCEP.', ?Throwable $previous = null): self
    {
        return new self($message, false, $previous);
    }

    public function isCepNotFound(): bool
    {
        return $this->cepNotFound;
    }
}
